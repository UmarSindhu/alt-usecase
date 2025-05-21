import React, { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

const AdPlaceholder = ({ slotKey, defaultText = "Advertisement", className = "h-24" }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [publisherId, setPublisherId] = useState('');

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const response = await fetch(`/api/service/ads/settings?slotKey=${encodeURIComponent(slotKey)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch ad settings');
        }

        const { isEnabled, publisherId } = await response.json();
        setIsEnabled(isEnabled);
        setPublisherId(publisherId);

      } catch (error) {
        console.error('Error fetching ad settings:', error);
        setIsEnabled(false);
        setPublisherId('');
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