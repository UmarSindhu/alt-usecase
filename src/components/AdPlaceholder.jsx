import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Megaphone } from 'lucide-react';

const AdPlaceholder = ({ slotKey, defaultText = "Advertisement", className = "h-24" }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [publisherId, setPublisherId] = useState('');

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const { data: slotSetting, error: slotError } = await supabase
          .from('ad_settings')
          .select('is_enabled')
          .eq('setting_key', slotKey)
          .single();

        if (slotError && slotError.code !== 'PGRST116') { 
          console.error(`Error fetching ad slot setting ${slotKey}:`, slotError);
        } else if (slotSetting) {
          setIsEnabled(slotSetting.is_enabled);
        } else {
          setIsEnabled(false); 
        }
        
        const { data: pubIdSetting, error: pubIdError } = await supabase
          .from('ad_settings')
          .select('setting_value')
          .eq('setting_key', 'adsense_publisher_id')
          .single();

        if (pubIdError && pubIdError.code !== 'PGRST116') {
          console.error('Error fetching AdSense Publisher ID:', pubIdError);
        } else if (pubIdSetting) {
          setPublisherId(pubIdSetting.setting_value || '');
        }

      } catch (error) {
        console.error('Unexpected error fetching ad settings:', error);
      }
    };

    fetchAdSettings();
  }, [slotKey]);

  if (!isEnabled) {
    return null; 
  }
  
  return (
    <div 
      className={`w-full bg-muted/50 dark:bg-muted/20 border border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground p-4 my-4 ${className}`}
    >
      <Megaphone className="h-8 w-8 mb-2" />
      <p className="text-sm">{defaultText}</p>
      {publisherId && <p className="text-xs mt-1">(AdSense ID: {publisherId})</p>}
    </div>
  );
};

export default AdPlaceholder;