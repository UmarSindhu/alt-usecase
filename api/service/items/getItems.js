import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
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

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});