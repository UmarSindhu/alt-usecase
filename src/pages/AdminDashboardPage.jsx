
    import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/hooks/useAuth';
    import { useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { ShieldCheck, Settings, CircleDot as TagsIcon, BarChart3, ImagePlus, Link2, Wand2, LogOut, Plus, Trash2, Edit3, Save, Megaphone } from 'lucide-react';
    import ContentManagementTab from '../components/admin/tabs/ContentManagementTab';
    import AdminTagsTab from '../components/admin/tabs/AdminTagsTab';
    import AdminAdsTab from '../components/admin/tabs/AdminAdsTab';
    import AdminStatsTab from '../components/admin/tabs/AdminStatsTab';
import AdminAffiliateTab from '../components/admin/tabs/AdminAffiliateTab';
import AdminAiTab from '../components/admin/tabs/AdminAiTab';
import AdminSuggestionsTab from '../components/admin/tabs/AdminSuggestionsTab';

    const AdminDashboardPage = () => {
      const { logout } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();
      
      const handleLogout = async () => {
        await logout();
        navigate('/login');
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      };

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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-4 text-xs sm:text-sm">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="tags-categories">Tags & Categories</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="ads">Ads</TabsTrigger>
                <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
                <TabsTrigger value="ai">AI Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <ContentManagementTab />
              </TabsContent>

              <TabsContent value="tags-categories" className="mt-4">
                <AdminTagsTab />
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <AdminSuggestionsTab />
              </TabsContent>

              <TabsContent value="stats" className="mt-4">
                <AdminStatsTab />
              </TabsContent>

              <TabsContent value="ads" className="space-y-4 mt-4">
                <AdminAdsTab />
              </TabsContent>

              <TabsContent value="affiliate" className="mt-4">
                <AdminAffiliateTab />
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <AdminAiTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      );
    };

    export default AdminDashboardPage;
  