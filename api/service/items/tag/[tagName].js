import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async function handler(req, res) {
  try {
    const { tagName } = req.query;

    if (!tagName) {
      return res.status(400).json({ error: 'tagName parameter is required' });
    }

    // First, get the tag ID
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single();

    if (tagError || !tag) {
      console.error('Tag error:', tagError);
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Then get items with this tag
    const { data, error } = await supabase
      .from('item_tags')
      .select(`
        items (
          *,
          uses:use_cases(*),
          tags:item_tags(tags(name)),
          categories:item_categories(categories(name, slug))
        )
      `)
      .eq('tag_id', tag.id);

    if (error) {
      console.error('Items error:', error);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    // Transform the data
    const transformedData = data.map(it => ({
      ...it.items,
      tags: it.items.tags?.map(t => t.tags.name) || [],
      category: it.items.categories?.[0]?.categories?.slug || null,
      uses: it.items.uses || []
    }));

    // Cache for 1 minute (tags might change more frequently)
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return res.status(200).json(transformedData);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});