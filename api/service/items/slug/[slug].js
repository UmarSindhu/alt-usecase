import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
    const { slug } = req.query;
    if (!slug) {
      return res.status(400).json({ error: 'Slug parameter is required' });
    }

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

    // Return null for not found items (instead of 404)
    if (error?.code === 'PGRST116' || !data) {
      return res.status(200).json(null); // Frontend expects null
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

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});