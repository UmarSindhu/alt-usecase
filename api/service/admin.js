import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';
import { sampleData } from '../../src/data/sampleData.js';

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

export default allowMethods(['GET', 'POST'], async function handler(req, res) {
  const { method, query } = req;
  const { op } = query;

  try {
    // GET operations
    if (method === 'GET') {
      // Get all categories (admin view)
      if (op === 'categories') {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
      }

      // Get all tags (admin view)
      if (op === 'tags') {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching tags:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
      }

      // Get all suggestions
      if (op === 'suggestions') {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching suggestions:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data || []);
      }
    }

    // POST operations
    if (method === 'POST') {
      // Add tag
      if (op === 'addTag') {
        const { name } = req.body;
        if (!name?.trim()) {
          return res.status(400).json({ error: 'Tag name is required' });
        }

        const { data, error } = await supabase
          .from('tags')
          .insert({ name: name.trim() })
          .select()
          .single();

        if (error) {
          console.error('Error adding tag:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      }

      // Update tag
      if (op === 'updateTag') {
        const { id, name } = req.body;
        if (!id || !name?.trim()) {
          return res.status(400).json({ error: 'Tag ID and name are required' });
        }

        const { data, error } = await supabase
          .from('tags')
          .update({ name: name.trim() })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating tag:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      }

      // Delete tag
      if (op === 'deleteTag') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Tag ID is required' });
        }

        const { error } = await supabase
          .from('tags')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting tag:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
      }

      // Add category
      if (op === 'addCategory') {
        const { name, slug, description, icon_name } = req.body;
        if (!name?.trim() || !slug?.trim()) {
          return res.status(400).json({ error: 'Category name and slug are required' });
        }

        const { data, error } = await supabase
          .from('categories')
          .insert({
            name: name.trim(),
            slug: slug.trim(),
            description: description?.trim() || null,
            icon_name: icon_name || 'Default'
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding category:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      }

      // Update category
      if (op === 'updateCategory') {
        const { id, name, slug, description, icon_name } = req.body;
        if (!id || !name?.trim() || !slug?.trim()) {
          return res.status(400).json({ error: 'Category ID, name, and slug are required' });
        }

        const { data, error } = await supabase
          .from('categories')
          .update({
            name: name.trim(),
            slug: slug.trim(),
            description: description?.trim() || null,
            icon_name: icon_name || 'Default'
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating category:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      }

      // Delete category
      if (op === 'deleteCategory') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Category ID is required' });
        }

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting category:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
      }

      // Update suggestion status
      if (op === 'updateSuggestion') {
        const { id, status } = req.body;
        if (!id || !status) {
          return res.status(400).json({ error: 'Suggestion ID and status are required' });
        }

        const { data, error } = await supabase
          .from('suggestions')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating suggestion:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(data);
      }

      // Delete suggestion
      if (op === 'deleteSuggestion') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Suggestion ID is required' });
        }

        const { error } = await supabase
          .from('suggestions')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting suggestion:', error);
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
      }

      // Seed items
      if (op === 'seed') {
        try {
    
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
    
              if (sample.uses?.length > 0) {
                const usesForDb = processUsesForSupabase(sample.uses, newItem.id);
                const { error: usesError } = await supabase.from('use_cases').insert(usesForDb);
                if (usesError) {
                  results.push({ item: sample.name, status: 'partial', warning: `Uses: ${usesError.message}` });
                }
              }
    
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
      }

      if(op === 'submitsuggestion') {
        const suggestionData = req.body;
        if (!suggestionData) {
          return res.status(400).json({ error: 'Suggestion data is required' });
        }
    
        const { error } = await supabase
          .from('suggestions')
          .insert([suggestionData]);
    
        if (error) {
          console.error('Supabase insert error:', error);
          return res.status(500).json({ error: error.message });
        }
    
        return res.status(201).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 