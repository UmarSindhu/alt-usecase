import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Megaphone } from 'lucide-react';

const AdminAdsTab = () => {
  const { toast } = useToast();
  const [adSettings, setAdSettings] = useState({});
  const [isLoadingAdSettings, setIsLoadingAdSettings] = useState(true);

  useEffect(() => {
    fetchAdSettings();
  }, []);

  const fetchAdSettings = async () => {
    setIsLoadingAdSettings(true);
    try {
      const response = await fetch('/api/service/ads?op=allSettings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch ad settings');
      }

      const settings = await response.json();
      setAdSettings(settings);
    } catch (error) {
      toast({
        title: "Error fetching ad settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdSettings(false);
    }
  };
  
  const handleAdSettingChange = async (key, value, type = 'value') => {
    const currentSetting = adSettings[key] || {};
    let updatedValue = value;
    let updatedIsEnabled = currentSetting.isEnabled;

    if (type === 'boolean') {
      updatedIsEnabled = value;
      updatedValue = currentSetting.value; 
    }
    
    // Optimistic update
    setAdSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value: updatedValue, isEnabled: updatedIsEnabled }
    }));

    try {
      const response = await fetch('/api/service/ads?op=updateSetting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key,
          value: updatedValue,
          isEnabled: updatedIsEnabled
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      toast({
        title: "Ad Setting Updated",
        description: `${key} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error updating ad setting",
        description: error.message,
        variant: "destructive",
      });
      // Revert on error
      fetchAdSettings();
    }
  };

  const adSlotOptions = [
    { key: 'ad_slot_header_enabled', label: 'Header Ad Slot' },
    { key: 'ad_slot_footer_enabled', label: 'Footer Ad Slot' },
    { key: 'ad_slot_homepage_hero_bottom_enabled', label: 'Homepage Hero Bottom Ad' },
    { key: 'ad_slot_homepage_featured_top_enabled', label: 'Homepage Featured Top Ad' },
    { key: 'ad_slot_usecase_page_top_enabled', label: 'Use Case Page Top Ad' },
    { key: 'ad_slot_usecase_page_incontent_enabled', label: 'Use Case Page In-Content Ads' },
    { key: 'ad_slot_usecase_page_bottom_enabled', label: 'Use Case Page Bottom Ad' },
    { key: 'ad_slot_category_page_top_enabled', label: 'Category Page Top Ad' },
    { key: 'ad_slot_category_page_inlist_enabled', label: 'Category Page In-List Ads' },
    { key: 'ad_slot_usecase_aside_bottom_enabled', label: 'Usecase Page Aside Ads' },
  ];

  if (isLoadingAdSettings) return <p>Loading ad settings...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Megaphone className="mr-2 h-5 w-5 text-primary" />
          AdSense & Ad Placements
        </CardTitle>
        <CardDescription>Manage your AdSense Publisher ID and toggle ad slots.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <>
          <div>
            <Label htmlFor="adsense_publisher_id">AdSense Publisher ID (e.g., pub-xxxxxxxxxxxxxxxx)</Label>
            <Input
              id="adsense_publisher_id"
              value={adSettings.adsense_publisher_id?.value || ''}
              onChange={(e) => handleAdSettingChange('adsense_publisher_id', e.target.value)}
              placeholder="pub-0000000000000000"
            />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Ad Slot Visibility</h4>
            {adSlotOptions.map(slot => (
              <div key={slot.key} className="flex items-center justify-between p-3 border rounded-lg">
                <Label htmlFor={slot.key} className="text-sm">{slot.label}</Label>
                <Switch
                  id={slot.key}
                  checked={adSettings[slot.key]?.isEnabled || false}
                  onCheckedChange={(checked) => handleAdSettingChange(slot.key, checked, 'boolean')}
                />
              </div>
            ))}
          </div>
        </>
      </CardContent>
    </Card>
  );
};

export default AdminAdsTab;