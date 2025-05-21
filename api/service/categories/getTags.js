import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true }); // Optional: Sort alphabetically

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch tags',
        details: error.message 
      });
    }

    // Cache for 1 hour (tags don't change often)
    res.setHeader('Cache-Control', 'public, s-maxage=3600');
    return res.status(200).json(data || []);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});