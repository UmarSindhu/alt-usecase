import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST'], async function handler(req, res) {
  try {

    const { defaultCategories } = req.body;

    if (!defaultCategories || !Array.isArray(defaultCategories)) {
      return res.status(400).json({ error: 'defaultCategories array is required' });
    }

    // Check existing categories
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

    // Insert missing categories
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

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});