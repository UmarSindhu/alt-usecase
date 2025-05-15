import { supabase } from '@/lib/supabaseClient';
import { sampleData } from '@/data/sampleData';
import { initializeDefaultCategories } from '@/lib/services/categoryService';

const processItemForSupabase = (item) => {
  const { uses, tags, categories, ...restOfItem } = item;
  return {
    ...restOfItem,
    name: item.name,
    slug: item.slug,
    image_url: item.image_url || null,
    seo_title: item.seo_title || `Alternative uses for ${item.name}`,
    seo_description: item.seo_description || `Discover creative and practical alternative uses for ${item.name}.`,
    canonical_url: item.canonical_url || `/use/${item.slug}`,
  };
};

const processUsesForSupabase = (uses, itemId) => {
  return uses.map(use => ({
    item_id: itemId,
    title: use.title,
    description: use.description,
    difficulty: use.difficulty || 'Easy',
    image_url: use.image_url || null,
    affiliate_link: use.affiliateLink || null,
    votes_yes: use.votes_yes || 0,
    votes_no: use.votes_no || 0,
  }));
};

export const seedSampleData = async () => {
  try {
    await initializeDefaultCategories();

    const { data: existingItems, error: fetchItemsError } = await supabase
      .from('items')
      .select('slug');
    
    if (fetchItemsError) {
      throw new Error(`Error fetching existing items: ${fetchItemsError.message}`);
    }

    const existingItemSlugs = existingItems?.map(item => item.slug) || [];

    for (const sample of sampleData) {
      if (existingItemSlugs.includes(sample.slug)) {
        console.log(`Item "${sample.name}" already exists. Skipping.`);
        continue;
      }

      // Insert the main item
      const itemForDb = processItemForSupabase(sample);
      const { data: newItem, error: itemError } = await supabase
        .from('items')
        .insert(itemForDb)
        .select()
        .single();

      if (itemError) {
        console.error(`Error inserting item ${sample.name}:`, itemError);
        continue;
      }

      if (!newItem) continue;

      // Insert use cases
      if (sample.uses?.length > 0) {
        const usesForDb = processUsesForSupabase(sample.uses, newItem.id);
        const { error: usesError } = await supabase.from('use_cases').insert(usesForDb);
        if (usesError) console.error(`Error inserting uses for ${sample.name}:`, usesError);
      }

      // Handle tags
      if (sample.tags?.length > 0) {
        for (const tagName of sample.tags) {
          try {
            // Try to find the tag first
            let { data: tag, error: tagError } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .maybeSingle(); // Use maybeSingle instead of single

            if (tagError) throw tagError;
            
            // If tag doesn't exist, create it
            if (!tag) {
              const { data: newTag, error: newTagError } = await supabase
                .from('tags')
                .insert({ name: tagName })
                .select()
                .single();
              
              if (newTagError) throw newTagError;
              tag = newTag;
            }

            // Link tag to item
            if (tag) {
              const { error: itemTagError } = await supabase
                .from('item_tags')
                .insert({ item_id: newItem.id, tag_id: tag.id });
              
              if (itemTagError && itemTagError.code !== '23505') { // Ignore duplicate key errors
                throw itemTagError;
              }
            }
          } catch (error) {
            console.error(`Error processing tag "${tagName}" for item "${sample.name}":`, error);
            continue; // Continue with next tag
          }
        }
      }
      
      // Handle categories
      if (sample.categories?.length > 0) {
        for (const categorySlug of sample.categories) {
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

          if (category) {
            await supabase
              .from('item_categories')
              .insert({ item_id: newItem.id, category_id: category.id })
              .select();
          }
        }
      }
    }

    console.log('Sample data seeding process completed.');
  } catch (error) {
    console.error('Error in seedSampleData:', error);
  }
};