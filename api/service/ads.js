import { supabase } from '#api/supabaseClient';
import { allowMethods } from '#api/apiMiddleware';

export default allowMethods(['GET', 'POST'], async function handler(req, res) {
  const { method, query } = req;
  const { op } = query;

  try {
    // GET operations
    if (method === 'GET') {
      // Get single ad slot setting
      if (!op || op === 'settings') {
        const { slotKey } = query;

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

        if (slotError || pubIdError) {
          console.error('Error fetching ad settings:', slotError || pubIdError);
          return res.status(500).json({ error: 'Failed to fetch ad settings' });
        }

        return res.status(200).json({
          isEnabled: slotSetting?.is_enabled || false,
          publisherId: pubIdSetting?.setting_value || ''
        });
      }

      // Get all ad settings (admin)
      if (op === 'allSettings') {
        const { data, error } = await supabase
          .from('ad_settings')
          .select('*');

        if (error) {
          console.error('Error fetching ad settings:', error);
          return res.status(500).json({ error: error.message });
        }
        
        const settingsMap = data.reduce((acc, setting) => {
          acc[setting.setting_key] = {
            value: setting.setting_value,
            isEnabled: setting.is_enabled,
            id: setting.id 
          };
          return acc;
        }, {});

        return res.status(200).json(settingsMap);
      }
    }

    // POST operations
    if (method === 'POST') {
      // Update ad setting
      if (op === 'updateSetting') {
        const { key, value, isEnabled } = req.body;

        if (!key) {
          return res.status(400).json({ error: 'Setting key is required' });
        }

        // First check if the setting exists
        const { data: existingSetting, error: checkError } = await supabase
          .from('ad_settings')
          .select('id')
          .eq('setting_key', key)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking existing setting:', checkError);
          return res.status(500).json({ error: checkError.message });
        }

        let result;
        if (existingSetting) {
          // Update existing setting
          result = await supabase
            .from('ad_settings')
            .update({
              setting_value: value,
              is_enabled: isEnabled
            })
            .eq('id', existingSetting.id)
            .select()
            .single();
        } else {
          // Insert new setting
          result = await supabase
            .from('ad_settings')
            .insert({
              setting_key: key,
              setting_value: value,
              is_enabled: isEnabled
            })
            .select()
            .single();
        }

        if (result.error) {
          console.error('Error updating ad setting:', result.error);
          return res.status(500).json({ error: result.error.message });
        }

        return res.status(200).json(result.data);
      }
    }

    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 