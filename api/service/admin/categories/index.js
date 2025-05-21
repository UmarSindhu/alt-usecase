import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: error.message });
  }
});