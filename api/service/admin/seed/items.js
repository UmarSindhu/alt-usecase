import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';
import { sampleData } from '@/data/sampleData';

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

export default allowMethods(['POST'], async (req, res) => {
  try {
    // Initialize categories first
    await initializeDefaultCategories();

    const { data: existingItems, error: fetchItemsError } = await supabase
      .from('items')
      .select('slug');
    
    if (fetchItemsError) {
      throw new Error(`Error fetching existing items: ${fetchItemsError.message}`);
    }

    const existingItemSlugs = existingItems?.map(item => item.slug) || [];
    const results = [];

    for (const sample of sampleData) {
      if (existingItemSlugs.includes(sample.slug)) {
        results.push({ item: sample.name, status: 'skipped', reason: 'already exists' });
        continue;
      }

      try {
        // Insert the main item
        const itemForDb = processItemForSupabase(sample);
        const { data: newItem, error: itemError } = await supabase
          .from('items')
          .insert(itemForDb)
          .select()
          .single();

        if (itemError || !newItem) {
          results.push({ item: sample.name, status: 'failed', error: itemError?.message });
          continue;
        }

        // Insert use cases
        if (sample.uses?.length > 0) {
          const usesForDb = processUsesForSupabase(sample.uses, newItem.id);
          const { error: usesError } = await supabase.from('use_cases').insert(usesForDb);
          if (usesError) {
            results.push({ item: sample.name, status: 'partial', warning: `Uses: ${usesError.message}` });
          }
        }

        // Handle tags
        if (sample.tags?.length > 0) {
          for (const tagName of sample.tags) {
            try {
              let { data: tag } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .maybeSingle();

              if (!tag) {
                const { data: newTag } = await supabase
                  .from('tags')
                  .insert({ name: tagName })
                  .select()
                  .single();
                tag = newTag;
              }

              if (tag) {
                await supabase
                  .from('item_tags')
                  .insert({ item_id: newItem.id, tag_id: tag.id });
              }
            } catch (tagError) {
              results.push({ item: sample.name, status: 'partial', warning: `Tag ${tagName}: ${tagError.message}` });
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
                .insert({ item_id: newItem.id, category_id: category.id });
            }
          }
        }

        results.push({ item: sample.name, status: 'success' });
      } catch (error) {
        results.push({ item: sample.name, status: 'failed', error: error.message });
      }
    }

    return res.status(200).json({ 
      success: true,
      results,
      message: 'Seed operation completed'
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});