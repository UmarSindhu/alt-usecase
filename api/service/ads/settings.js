import { supabase } from '#api/supabaseClient';
import { allowMethods} from '#api/apiMiddleware';

export default allowMethods(['GET'], async (req, res) => {
  try {
    const { slotKey } = req.query;

    if (!slotKey) {
      return res.status(400).json({ error: 'slotKey is required' });
    }

    // Fetch both settings in parallel
    const [
      { data: slotSetting, error: slotError },
      { data: pubIdSetting, error: pubIdError }
    ] = await Promise.all([
      supabase
        .from('ad_settings')
        .select('is_enabled')
        .eq('setting_key', slotKey)
        .single(),
      
      supabase
        .from('ad_settings')
        .select('setting_value')
        .eq('setting_key', 'adsense_publisher_id')
        .single()
    ]);

    return res.status(200).json({
      isEnabled: slotSetting?.is_enabled || false,
      publisherId: pubIdSetting?.setting_value || ''
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      isEnabled: false,
      publisherId: ''
    });
  }
});