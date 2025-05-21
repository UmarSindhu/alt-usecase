import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['POST'], async (req, res) => {
  try {
    const { key, value, isEnabled } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const { error } = await supabase
      .from('ad_settings')
      .update({ 
        setting_value: value,
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', key);

    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating ad setting:', error);
    return res.status(500).json({ error: error.message });
  }
});