import { supabase } from '../src/lib/supabaseClient.js';
import { CATEGORIES } from '../src/lib/constants.js';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ error: 'itemName is required' });
  }

  try {
    const result = await generateAndStoreItem(itemName);
    res.status(200).json(result);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const generateAndStoreItem = async (itemName) => {
  const slug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Check if item exists
  const { data: existingItem, error: fetchError } = await supabase
    .from('items')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { 
    console.error('Error checking for existing item:', fetchError);
    return null;
  }
  if (existingItem) return getItemBySlug(existingItem.slug);

  // --- 1. Fetch SINGLE Image from Pexels ---
  let imageUrl = null;
  let pexelsAttribution = null;
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(itemName)}&per_page=1`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await response.json();
    if (data.photos?.length > 0) {
      imageUrl = data.photos[0].src.large;
      pexelsAttribution = `Photo by ${data.photos[0].photographer} on Pexels`;
    }
  } catch (error) {
    console.error("Pexels API error:", error);
  }

  // --- 2. AI Call for Uses + Categories ---
  let aiUses = [];
  let suggestedCategories = [];
  try {
    // Get category names from the CATEGORIES array
    const categoryNames = CATEGORIES.map(c => c.name);
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1800,
        messages: [{
          role: "user",
          content: `For "${itemName}":
            1. Generate 10-15 alternative uses as JSON array
            2. Suggest 1-3 categories from: ${categoryNames.join(', ')}

            Return ONLY this JSON format:
            {
              "uses": [{
                "title": "Use 1",
                "description": "25-45 words description", 
                "difficulty": "Easy/Medium/Hard"
              }],
              "categories": ["Category1", "Category2"]
            }`
        }]
      })
    });

    const data = await response.json();
    const aiText = data.choices[0]?.message?.content;
    console.log("DeepSeek response: ", data);
    
    // Robust JSON parsing
    let parsed = {};
    try {
      parsed = JSON.parse(aiText.replace(/```json|```/g, '').trim());
    } catch {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    }

    aiUses = Array.isArray(parsed?.uses) ? parsed.uses : [];
    suggestedCategories = Array.isArray(parsed?.categories) ? parsed.categories : [];

  } catch (error) {
    console.error("AI API error:", error);
    aiUses = Array.from({ length: 3 }, (_, i) => ({
      title: `Use ${i + 1} for ${itemName}`,
      description: `Default description`,
      difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
      votes_yes: 0,
      votes_no: 0
    }));
    suggestedCategories = ['DIY'];
  }

  // --- 3. Insert Item ---
  const { data: newItem, error: itemError } = await supabase
    .from('items')
    .insert({
      name: itemName,
      slug,
      image_url: imageUrl,
      attribution: pexelsAttribution,
      seo_title: `Uses for ${itemName}`,
      seo_description: `Creative ways to use ${itemName}`
    })
    .select()
    .single();

  if (itemError) {
    console.error('Item insertion failed:', itemError);
    return null;
  }

  // --- 4. Insert Uses ---
  const { error: usesError } = await supabase
    .from('use_cases')
    .insert(aiUses.map(use => ({
      ...use,
      item_id: newItem.id,
      votes_yes: 0,
      votes_no: 0
    })));

  if (usesError) console.error('Uses insertion failed:', usesError);

  // --- 5. Assign Categories ---
  if (suggestedCategories.length > 0) {
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .in('name', suggestedCategories);

    if (categories?.length > 0) {
      await supabase
        .from('item_categories')
        .insert(categories.map(c => ({ 
          item_id: newItem.id, 
          category_id: c.id 
        })));
    }
  }

  return getItemBySlug(slug);
};

async function getItemBySlug(slug) {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      use_cases(*),
      item_categories!inner(
        categories(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
}