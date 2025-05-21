import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
    const { categorySlug } = req.query;

    if (!categorySlug) {
      return res.status(400).json({ error: 'categorySlug parameter is required' });
    }

    // First, get the category ID
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError || !category) {
      console.error('Category error:', categoryError);
      return res.status(404).json({ error: 'Category not found' });
    }

    // Then get items in this category
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

    // Transform the data
    const transformedData = data.map(ic => ({
      ...ic.items,
      tags: ic.items.tags?.map(t => t.tags.name) || [],
      category: categorySlug,
      uses: ic.items.uses || [],
      categories: ic.items.categories?.map(c => c.categories) || []
    }));

    // Cache for 2 minutes (categories don't change often)
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=240');

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});