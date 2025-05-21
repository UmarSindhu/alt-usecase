import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return res.status(500).json({ error: error.message });
  }
});