import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ad_settings')
      .select('*');

    if (error) throw error;
    
    const settingsMap = data.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        isEnabled: setting.is_enabled,
        id: setting.id 
      };
      return acc;
    }, {});

    return res.status(200).json(settingsMap);
  } catch (error) {
    console.error('Error fetching ad settings:', error);
    return res.status(500).json({ error: error.message });
  }
});