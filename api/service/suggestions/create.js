import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST'], async function handler(req, res) {
  try {
    const suggestionData = req.body;

    if (!suggestionData) {
      return res.status(400).json({ error: 'Suggestion data is required' });
    }

    const { error } = await supabase
      .from('suggestions')
      .insert([suggestionData]);

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ success: true });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});