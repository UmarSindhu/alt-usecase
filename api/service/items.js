import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';
import { CATEGORIES } from '../../src/lib/constants.js';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Helper function to get item by slug
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

export default allowMethods(['GET', 'POST', 'PUT', 'DELETE'], async function handler(req, res) {
  const { method, query } = req;
  const { op, slug, categorySlug, tagName } = query;

  try {
    // GET operations
    if (method === 'GET') {
      // Get all items
      if (!op) {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            uses:use_cases(*),
            tags:item_tags(tags(name)),
            categories:item_categories(categories(name, slug))
          `)
          .order('created_at', { ascending: false, foreignTable: 'use_cases' });

        if (error) {
          console.error('Error fetching items:', error);
          return res.status(500).json({ error: 'Failed to fetch items' });
        }

        const transformedData = data.map(item => ({
          ...item,
          tags: item.tags.map(t => t.tags.name),
          category: item.categories[0]?.categories.slug,
          uses: item.uses || [],
        }));

        return res.status(200).json(transformedData);
      }

      // Get recent items
      if (op === 'recent') {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            uses:use_cases(*),
            tags:item_tags(tags(name)),
            categories:item_categories(categories(name, slug))
          `)
          .order('created_at', { ascending: false })
          .limit(9)
          .order('created_at', { ascending: false, foreignTable: 'use_cases' });

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch recent items' });
        }

        const transformedData = data.map(item => ({
          ...item,
          tags: item.tags?.map(t => t.tags.name) || [],
          category: item.categories?.[0]?.categories?.slug || null,
          uses: item.uses || []
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return res.status(200).json(transformedData);
      }

      // Get random item
      if (op === 'random') {
        const { data, error } = await supabase.rpc('get_random_item');
    
        if (error || !data?.length) {
          console.error('RPC failed, falling back to manual random selection:', error);
          
          const { data: allItems, error: allItemsError } = await supabase
            .from('items')
            .select('slug');
          
          if (allItemsError || !allItems?.length) {
            console.error('No items available:', allItemsError);
            return res.status(404).json({ error: 'No items available' });
          }
          
          const randomSlug = allItems[Math.floor(Math.random() * allItems.length)].slug;
          return res.status(200).json(randomSlug);
        }
        
        return res.status(200).json(data[0].slug);
      }

      // Get item by slug
      if (op === 'bySlug' && slug) {
        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            uses:use_cases(*),
            tags:item_tags(tags(name)),
            categories:item_categories(categories(name, slug))
          `)
          .eq('slug', slug)
          .single();

        if (error?.code === 'PGRST116' || !data) {
          return res.status(200).json(null);
        }

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ error: 'Failed to fetch item' });
        }

        const transformedData = {
          ...data,
          tags: data.tags?.map(t => t.tags.name) || [],
          categories: data.categories?.map(c => c.categories) || [],
          uses: data.uses || []
        };

        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return res.status(200).json(transformedData);
      }

      // Get items by category
      if (op === 'byCategory' && categorySlug) {
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (categoryError || !category) {
          console.error('Category error:', categoryError);
          return res.status(404).json({ error: 'Category not found' });
        }

        const { data, error } = await supabase
          .from('item_categories')
          .select(`
            items (
              *,
              uses:use_cases(*),
              tags:item_tags(tags(name)),
              categories:item_categories(categories(name, slug))
            )
          `)
          .eq('category_id', category.id);

        if (error) {
          console.error('Items error:', error);
          return res.status(500).json({ error: 'Failed to fetch items' });
        }

        const transformedData = data.map(ic => ({
          ...ic.items,
          tags: ic.items.tags?.map(t => t.tags.name) || [],
          category: categorySlug,
          uses: ic.items.uses || [],
          categories: ic.items.categories?.map(c => c.categories) || []
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');
        return res.status(200).json(transformedData);
      }

      // Get items by tag
      if (op === 'byTag' && tagName) {
        const { data: tag, error: tagError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single();

        if (tagError || !tag) {
          console.error('Tag error:', tagError);
          return res.status(404).json({ error: 'Tag not found' });
        }

        const { data, error } = await supabase
          .from('item_tags')
          .select(`
            items (
              *,
              uses:use_cases(*),
              tags:item_tags(tags(name)),
              categories:item_categories(categories(name, slug))
            )
          `)
          .eq('tag_id', tag.id);

        if (error) {
          console.error('Items error:', error);
          return res.status(500).json({ error: 'Failed to fetch items' });
        }

        const transformedData = data.map(it => ({
          ...it.items,
          tags: it.items.tags?.map(t => t.tags.name) || [],
          category: it.items.categories?.[0]?.categories?.slug || null,
          uses: it.items.uses || []
        }));

        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
        return res.status(200).json(transformedData);
      }
    }

    // POST operations
    if (method === 'POST') {
      // Generate item
      if (op === 'generate') {
        const { itemName } = req.body;

        if (!itemName) {
          return res.status(400).json({ error: 'itemName is required' });
        }

        const slug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Check if item exists
        const { data: existingItem, error: fetchError } = await supabase
          .from('items')
          .select('id, slug')
          .eq('slug', slug)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { 
          console.error('Error checking for existing item:', fetchError);
          return res.status(500).json({ error: 'Failed to check existing item' });
        }
        if (existingItem) {
          const item = await getItemBySlug(existingItem.slug);
          return res.status(200).json(item);
        }

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
        let suggestedTags = [];
        let affiliateLink = '';
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
                  1. Generate 10-15 alternative uses as JSON array. Each use description should be around 40-45 words.
                  2. Suggest 1-3 categories from: ${categoryNames.join(', ')}
                  3. Suggest 3-4 tags
                  4. Generate 1 affiliate link from Amazon for each use
                  Return ONLY this JSON format:
                  {
                    "uses": [{
                      "title": "Use 1",
                      "description": "40-45 words description", 
                      "difficulty": "Easy/Medium/Hard",
                      "affiliate_link": "https://www.amazon.com/s?k=Use+1"
                    }],
                    "categories": ["Category1", "Category2"],
                    "tags": ["tag1", "tag2"],
                  }`
              }]
            })
          });

          const data = await response.json();
          const aiText = data.choices[0]?.message?.content;
          
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
          suggestedTags = Array.isArray(parsed?.tags) ? parsed.tags : [];
          affiliateLink = `https://www.amazon.com/s?k=${itemName}`;
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
          suggestedTags = ['DIY', 'Creative Ideas'];
        }

        // --- 3. Insert Item ---
        const { data: newItem, error: itemError } = await supabase
          .from('items')
          .insert({
            name: itemName,
            slug,
            image_url: imageUrl,
            affiliate_link: affiliateLink,
            attribution: pexelsAttribution,
            seo_title: `Uses for ${itemName}`,
            seo_description: `Creative ways to use ${itemName}`,
            canonical_url: `/use/${itemName}`
          })
          .select()
          .single();

        if (itemError) {
          console.error('Item insertion failed:', itemError);
          return res.status(500).json({ error: 'Failed to create item' });
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

        // --- 6. Assign Tags ---
        if (suggestedTags.length > 0) {
          const { data: tags } = await supabase
            .from('tags')
            .select('id')
            .in('name', suggestedTags);

          if (tags?.length > 0) {
            await supabase
              .from('item_tags')
              .insert(tags.map(t => ({ 
                item_id: newItem.id, 
                tag_id: t.id 
              })));
          }
        }

        const finalItem = await getItemBySlug(slug);
        return res.status(200).json(finalItem);
      }

      // Vote on use case
      if (op === 'vote') {
        const { useCaseId, voteType } = req.body;
        // Validate input
        if (!useCaseId || !voteType || !['yes', 'no'].includes(voteType)) {
          return res.status(400).json({ error: 'Invalid useCaseId or voteType' });
        }

        // Fetch current vote counts
        const { data: useCase, error: fetchError } = await supabase
          .from('use_cases')
          .select('votes_yes, votes_no')
          .eq('id', useCaseId)
          .single();

        if (fetchError || !useCase) {
          console.error('Error fetching use case:', fetchError);
          return res.status(404).json({ error: 'Use case not found' });
        }

        // Prepare update data
        const updateData = {
          votes_yes: voteType === 'yes' ? (useCase.votes_yes || 0) + 1 : useCase.votes_yes,
          votes_no: voteType === 'no' ? (useCase.votes_no || 0) + 1 : useCase.votes_no,
          updated_at: new Date().toISOString()
        };

        // Update vote count
        const { error: updateError } = await supabase
          .from('use_cases')
          .update(updateData)
          .eq('id', useCaseId);

        if (updateError) {
          console.error('Error updating vote count:', updateError);
          return res.status(500).json({ error: 'Failed to update vote count' });
        }

        return res.status(200).json({ 
          success: true,
          newVotes: updateData
        });
      }
    }

    // PUT operations
    if (method === 'PUT') {
      if (op === 'update') {
        const { itemSlug, itemData } = req.body;
        if (!itemSlug || !itemData) {
          return res.status(400).json({ error: 'itemSlug and itemData are required' });
        }

        const { data, error } = await supabase
          .from('items')
          .update(itemData)
          .eq('slug', itemSlug)
          .select()
          .single();

        if (error) {
          console.error('Error updating item:', error);
          return res.status(500).json({ error: 'Failed to update item' });
        }

        return res.status(200).json(data);
      }
    }

    // DELETE operations
    if (method === 'DELETE') {
      if (op === 'delete') {
        const { itemSlug } = req.body;
        if (!itemSlug) {
          return res.status(400).json({ error: 'itemSlug is required' });
        }

        const { error } = await supabase
          .from('items')
          .delete()
          .eq('slug', itemSlug);

        if (error) {
          console.error('Error deleting item:', error);
          return res.status(500).json({ error: 'Failed to delete item' });
        }

        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
