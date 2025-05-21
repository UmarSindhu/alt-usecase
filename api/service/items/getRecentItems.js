import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
    // Fetch recent items with relations
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

    // Transform data
    const transformedData = data.map(item => ({
      ...item,
      tags: item.tags?.map(t => t.tags.name) || [],
      category: item.categories?.[0]?.categories?.slug || null,
      uses: item.uses || []
    }));

    // Set cache headers (1 minute cache, 2 minute stale-while-revalidate)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});