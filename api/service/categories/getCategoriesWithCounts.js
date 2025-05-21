import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { limit } = req.query;
    
    // Always fetch all categories for accurate sorting
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

    // Process counts and sort
    const processed = (data || []).map(c => ({
      ...c,
      item_count: c.item_categories[0]?.count || 0
    })).sort((a, b) => b.item_count - a.item_count);

    // Apply limit if specified
    const result = limit && !isNaN(limit) 
      ? processed.slice(0, Number(limit))
      : processed;

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).json(result);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      useDefaults: true
    });
  }
});