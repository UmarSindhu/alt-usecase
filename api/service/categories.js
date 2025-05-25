import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';

export default allowMethods(['GET', 'POST'], async function handler(req, res) {
  const { method, query } = req;
  const { op } = query;

  try {
    // GET operations
    if (method === 'GET') {
      // Get all categories
      if (!op || op === 'all') {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch categories',
            useDefault: true 
          });
        }

        return res.status(200).json(data);
      }

      // Get categories with counts
      if (op === 'withCounts') {
        const { limit } = query;
        
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            item_categories (
              count
            )
          `);

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch categories',
            useDefaults: true
          });
        }

        const processed = (data || []).map(c => ({
          ...c,
          item_count: c.item_categories[0]?.count || 0
        })).sort((a, b) => b.item_count - a.item_count);

        const result = limit && !isNaN(limit) 
          ? processed.slice(0, Number(limit))
          : processed;

        res.setHeader('Cache-Control', 'public, s-maxage=300');
        return res.status(200).json(result);
      }

      // Get all tags
      if (op === 'tags') {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          return res.status(500).json({ 
            error: 'Failed to fetch tags',
            details: error.message 
          });
        }

        res.setHeader('Cache-Control', 'public, s-maxage=3600');
        return res.status(200).json(data || []);
      }
    }

    // POST operations
    if (method === 'POST') {
      // Initialize categories
      if (op === 'initialize') {
        const { defaultCategories } = req.body;

        if (!defaultCategories || !Array.isArray(defaultCategories)) {
          return res.status(400).json({ error: 'defaultCategories array is required' });
        }

        const { data: existingCategories, error: fetchError } = await supabase
          .from('categories')
          .select('slug');

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch existing categories' });
        }

        const existingSlugs = existingCategories?.map(c => c.slug) || [];
        const categoriesToInsert = defaultCategories
          .filter(dc => !existingSlugs.includes(dc.slug))
          .map(category => ({
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon_name: category.iconName || 'Package',
          }));

        if (categoriesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('categories')
            .insert(categoriesToInsert);

          if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(500).json({ error: 'Failed to initialize categories' });
          }
        }

        return res.status(200).json({ 
          success: true,
          initializedCount: categoriesToInsert.length
        });
      }
    }

    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 