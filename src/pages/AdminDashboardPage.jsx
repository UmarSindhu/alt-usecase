
    import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/hooks/useAuth';
    import { useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { ShieldCheck, Settings, CircleDot as TagsIcon, BarChart3, ImagePlus, Link2, Wand2, LogOut, Plus, Trash2, Edit3, Save, Megaphone } from 'lucide-react';
    import { getItems } from '@/lib/useCaseService';

    const AdminDashboardPage = () => {
      const { logout } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();
      const [items, setItems] = useState(getItems());
      const [selectedItem, setSelectedItem] = useState(null);
      const [isEditing, setIsEditing] = useState(false);
      const [adSettings, setAdSettings] = useState({});
      const [isLoadingAdSettings, setIsLoadingAdSettings] = useState(true);

      useEffect(() => {
        fetchAdSettings();
      }, []);

      const fetchAdSettings = async () => {
        setIsLoadingAdSettings(true);
        try {
          const { data, error } = await supabase.from('ad_settings').select('*');
          if (error) throw error;
          
          const settingsMap = data.reduce((acc, setting) => {
            acc[setting.setting_key] = {
              value: setting.setting_value,
              isEnabled: setting.is_enabled,
              id: setting.id 
            };
            return acc;
          }, {});
          setAdSettings(settingsMap);
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
        
        setAdSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value: updatedValue, isEnabled: updatedIsEnabled }
        }));

        try {
            const { error } = await supabase
            .from('ad_settings')
            .update({ 
                setting_value: updatedValue,
                is_enabled: updatedIsEnabled,
                updated_at: new Date().toISOString()
            })
            .eq('setting_key', key);

          if (error) throw error;
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
          fetchAdSettings(); 
        }
      };


      const handleLogout = async () => {
        await logout();
        navigate('/login');
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      };

      const handleEditItem = (item) => {
        setSelectedItem(JSON.parse(JSON.stringify(item))); 
        setIsEditing(true);
      };

      const handleDeleteItem = (itemSlug) => {
        const updatedItems = items.filter(item => item.slug !== itemSlug);
        localStorage.setItem('altUseAppItems', JSON.stringify(updatedItems));
        setItems(updatedItems);
        toast({
          title: "Item Deleted",
          description: "The item has been successfully removed.",
        });
      };

      const handleSaveItem = () => {
        if (!selectedItem) return;
        
        const updatedItems = items.map(item => 
          item.slug === selectedItem.originalSlug ? { ...selectedItem, slug: selectedItem.slug } : item
        );
        
        localStorage.setItem('altUseAppItems', JSON.stringify(updatedItems));
        setItems(updatedItems);
        setIsEditing(false);
        setSelectedItem(null);
        
        toast({
          title: "Changes Saved",
          description: "The item has been successfully updated.",
        });
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
      ];

      return (
        <>
          <Helmet>
            <title>Admin Dashboard | Alt Use Case</title>
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold flex items-center">
                <ShieldCheck className="mr-3 h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-xs sm:text-sm">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="ads">Ads</TabsTrigger>
                <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
                <TabsTrigger value="ai">AI Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Content</CardTitle>
                    <CardDescription>Add, edit, or delete use case pages.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.slug} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">/{item.slug} - {item.uses.length} uses</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditItem({...item, originalSlug: item.slug })}>
                              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.slug)}>
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {isEditing && selectedItem && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Edit: {selectedItem.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={selectedItem.name}
                            onChange={(e) => setSelectedItem(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-slug">Slug (URL Path)</Label>
                          <Input
                            id="edit-slug"
                            value={selectedItem.slug}
                            onChange={(e) => setSelectedItem(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                          <Input
                            id="edit-tags"
                            value={selectedItem.tags.join(', ')}
                            onChange={(e) => setSelectedItem(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                          />
                        </div>
                        <Button onClick={handleSaveItem}>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => { setIsEditing(false); setSelectedItem(null); }} className="ml-2">
                          Cancel
                        </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tags" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><TagsIcon className="mr-2 h-5 w-5 text-primary" />Tag Management</CardTitle>
                    <CardDescription>Manage categories and tags used across the site.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Tag management features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Site Statistics</CardTitle>
                    <CardDescription>View most viewed items, popular search terms, etc.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Analytics dashboard coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ads" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><Megaphone className="mr-2 h-5 w-5 text-primary" />AdSense & Ad Placements</CardTitle>
                    <CardDescription>Manage your AdSense Publisher ID and toggle ad slots.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoadingAdSettings ? <p>Loading ad settings...</p> : (
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="affiliate" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><Link2 className="mr-2 h-5 w-5 text-primary" />Affiliate Settings</CardTitle>
                    <CardDescription>Control affiliate link settings (e.g., Amazon API or custom URLs).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Affiliate management features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center"><Wand2 className="mr-2 h-5 w-5 text-primary" />AI Configuration</CardTitle>
                    <CardDescription>Toggle AI usage for fallback content generation and manage API keys.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>AI settings and controls coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      );
    };

    export default AdminDashboardPage;
  