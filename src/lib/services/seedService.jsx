
    import { supabase } from '@/lib/supabaseClient';
    import { sampleData } from '@/data/sampleData';
    import { initializeDefaultCategories } from '@/lib/services/categoryService';

    const processItemForSupabase = (item) => {
      const { uses, tags, category, ...restOfItem } = item;
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
      await initializeDefaultCategories();

      const { data: existingItems, error: fetchItemsError } = await supabase
        .from('items')
        .select('slug');
      
      if (fetchItemsError) {
        console.error('Error fetching existing items:', fetchItemsError);
        return;
      }
      const existingItemSlugs = existingItems.map(item => item.slug);

      for (const sample of sampleData) {
        if (existingItemSlugs.includes(sample.slug)) {
          console.log(`Item "${sample.name}" already exists. Skipping.`);
          continue;
        }

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

        if (newItem) {
          const usesForDb = processUsesForSupabase(sample.uses, newItem.id);
          const { error: usesError } = await supabase.from('use_cases').insert(usesForDb);
          if (usesError) console.error(`Error inserting uses for ${sample.name}:`, usesError);

          if (sample.tags && sample.tags.length > 0) {
            for (const tagName of sample.tags) {
              let { data: tag, error: tagError } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .single();

              if (!tag && !tagError) {
                const { data: newTag, error: newTagError } = await supabase
                  .from('tags')
                  .insert({ name: tagName })
                  .select()
                  .single();
                if (newTagError) {
                  console.error(`Error inserting tag ${tagName}:`, newTagError);
                  continue;
                }
                tag = newTag;
              } else if (tagError && tagError.code !== 'PGRST116') { 
                console.error(`Error fetching tag ${tagName}:`, tagError);
                continue;
              }
              
              if (tag) {
                const { error: itemTagError } = await supabase
                  .from('item_tags')
                  .insert({ item_id: newItem.id, tag_id: tag.id });
                if (itemTagError && itemTagError.code !== '23505') {
                   console.error(`Error linking tag ${tagName} to ${sample.name}:`, itemTagError);
                }
              }
            }
          }
          
          if (sample.category) {
            const { data: categoryData, error: categoryError } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', sample.category)
              .single();
            if (categoryError) {
              console.error(`Error fetching category ${sample.category}:`, categoryError);
            } else if (categoryData) {
              const { error: itemCatError } = await supabase
                .from('item_categories')
                .insert({ item_id: newItem.id, category_id: categoryData.id });
              if (itemCatError && itemCatError.code !== '23505') {
                console.error(`Error linking category ${sample.category} to ${sample.name}:`, itemCatError);
              }
            }
          }
        }
      }
      console.log('Sample data seeding process completed.');
      localStorage.setItem('altuse-data-seeded-supabase', 'true');
    };
  