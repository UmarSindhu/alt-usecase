
    import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';
    import { Plus, Trash2, Edit3, Save, Tag as TagIcon, Cpu, FolderHeart as HouseholdIcon, Utensils, Wrench, Package, Palette, Sprout, Sparkles as SparklesIcon, Plane, Car, X as XIcon } from 'lucide-react';

    const iconMap = {
        Cpu, HouseholdIcon, Utensils, Wrench, Package, Palette, Sprout, SparklesIcon, Plane, Car, Default: TagIcon
    };
    
    const AdminTagsTab = () => {
      const { toast } = useToast();
      const [tags, setTags] = useState([]);
      const [categories, setCategories] = useState([]);
      const [editingTag, setEditingTag] = useState(null);
      const [editingCategory, setEditingCategory] = useState(null);
      const [newTagName, setNewTagName] = useState('');
      const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', icon_name: 'Default' });
      const [isLoading, setIsLoading] = useState(true);

      const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
          const { data: tagsData, error: tagsError } = await supabase.from('tags').select('*').order('name');
          if (tagsError) throw tagsError;
          setTags(tagsData);

          const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('name');
          if (categoriesError) throw categoriesError;
          setCategories(categoriesData);
        } catch (error)          {
          toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);

      const handleAddTag = async () => {
        if (!newTagName.trim()) {
          toast({ title: "Tag name cannot be empty", variant: "destructive" });
          return;
        }
        try {
          const { data, error } = await supabase.from('tags').insert({ name: newTagName.trim() }).select();
          if (error) throw error;
          setTags(prev => [...prev, ...data]);
          setNewTagName('');
          toast({ title: "Tag Added", description: `Tag "${newTagName}" created.` });
        } catch (error) {
          toast({ title: "Error adding tag", description: error.message, variant: "destructive" });
        }
      };

      const handleUpdateTag = async () => {
        if (!editingTag || !editingTag.name.trim()) return;
        try {
          const { error } = await supabase.from('tags').update({ name: editingTag.name.trim() }).eq('id', editingTag.id);
          if (error) throw error;
          fetchData(); 
          setEditingTag(null);
          toast({ title: "Tag Updated" });
        } catch (error) {
          toast({ title: "Error updating tag", description: error.message, variant: "destructive" });
        }
      };

      const handleDeleteTag = async (tagId) => {
        if (!window.confirm("Are you sure you want to delete this tag? This might affect existing items.")) return;
        try {
          await supabase.from('item_tags').delete().eq('tag_id', tagId);
          const { error } = await supabase.from('tags').delete().eq('id', tagId);
          if (error) throw error;
          fetchData(); 
          toast({ title: "Tag Deleted" });
        } catch (error) {
          toast({ title: "Error deleting tag", description: error.message, variant: "destructive" });
        }
      };

      const handleAddCategory = async () => {
        if (!newCategory.name.trim() || !newCategory.slug.trim()) {
          toast({ title: "Category name and slug cannot be empty", variant: "destructive" });
          return;
        }
        try {
          const { data, error } = await supabase.from('categories').insert(newCategory).select();
          if (error) throw error;
          setCategories(prev => [...prev, ...data]);
          setNewCategory({ name: '', slug: '', description: '', icon_name: 'Default' });
          toast({ title: "Category Added" });
        } catch (error) {
          toast({ title: "Error adding category", description: error.message, variant: "destructive" });
        }
      };

      const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name.trim() || !editingCategory.slug.trim()) return;
        try {
          const { error } = await supabase.from('categories').update(editingCategory).eq('id', editingCategory.id);
          if (error) throw error;
          fetchData(); 
          setEditingCategory(null);
          toast({ title: "Category Updated" });
        } catch (error) {
          toast({ title: "Error updating category", description: error.message, variant: "destructive" });
        }
      };

      const handleDeleteCategory = async (categoryId) => {
         if (!window.confirm("Are you sure you want to delete this category? This might affect existing items.")) return;
        try {
          await supabase.from('item_categories').delete().eq('category_id', categoryId);
          const { error } = await supabase.from('categories').delete().eq('id', categoryId);
          if (error) throw error;
          fetchData(); 
          toast({ title: "Category Deleted" });
        } catch (error) {
          toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
        }
      };
      
      const renderIcon = (iconName) => {
        const IconComponent = iconMap[iconName] || iconMap.Default;
        return <IconComponent className="h-4 w-4 mr-2" />;
      };


      if (isLoading) return <p>Loading tags and categories...</p>;

      return (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Tags</CardTitle>
              <CardDescription>Add, edit, or delete tags for items.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="New tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                <Button onClick={handleAddTag}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tags.map(tag => (
                  <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                    {editingTag?.id === tag.id ? (
                      <Input value={editingTag.name} onChange={(e) => setEditingTag({...editingTag, name: e.target.value})} className="h-8"/>
                    ) : (
                      <span className="text-sm">{tag.name}</span>
                    )}
                    <div className="flex gap-1">
                      {editingTag?.id === tag.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={handleUpdateTag}><Save className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditingTag(null)}><XIcon className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setEditingTag(tag)}><Edit3 className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTag(tag.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, or delete item categories.</CardDescription>
            </CardHeader>
            <CardContent>
              {editingCategory ? (
                <div className="space-y-3 p-3 border rounded-md mb-4">
                  <h4 className="font-medium">Edit Category: {editingCategory.name}</h4>
                  <div><Label htmlFor={`edit-cat-name-${editingCategory.id}`}>Name</Label><Input id={`edit-cat-name-${editingCategory.id}`} value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} /></div>
                  <div><Label htmlFor={`edit-cat-slug-${editingCategory.id}`}>Slug</Label><Input id={`edit-cat-slug-${editingCategory.id}`} value={editingCategory.slug} onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} /></div>
                  <div><Label htmlFor={`edit-cat-desc-${editingCategory.id}`}>Description</Label><Input id={`edit-cat-desc-${editingCategory.id}`} value={editingCategory.description || ''} onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})} /></div>
                  <div><Label htmlFor={`edit-cat-icon-${editingCategory.id}`}>Icon Name</Label>
                    <select id={`edit-cat-icon-${editingCategory.id}`} value={editingCategory.icon_name || 'Default'} onChange={(e) => setEditingCategory({...editingCategory, icon_name: e.target.value})} className="w-full p-2 border rounded-md bg-background">
                        {Object.keys(iconMap).map(iconKey => <option key={iconKey} value={iconKey}>{iconKey}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateCategory}><Save className="h-4 w-4 mr-1" />Save</Button>
                    <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 border rounded-md mb-4">
                  <h4 className="font-medium">Add New Category</h4>
                  <div><Label htmlFor="new-cat-name">Name</Label><Input id="new-cat-name" placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} /></div>
                  <div><Label htmlFor="new-cat-slug">Slug</Label><Input id="new-cat-slug" placeholder="category-slug" value={newCategory.slug} onChange={(e) => setNewCategory({...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} /></div>
                  <div><Label htmlFor="new-cat-desc">Description</Label><Input id="new-cat-desc" placeholder="Optional description" value={newCategory.description} onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} /></div>
                  <div><Label htmlFor="new-cat-icon">Icon Name</Label>
                    <select id="new-cat-icon" value={newCategory.icon_name} onChange={(e) => setNewCategory({...newCategory, icon_name: e.target.value})} className="w-full p-2 border rounded-md bg-background">
                        {Object.keys(iconMap).map(iconKey => <option key={iconKey} value={iconKey}>{iconKey}</option>)}
                    </select>
                  </div>
                  <Button onClick={handleAddCategory} className="w-full"><Plus className="h-4 w-4 mr-1" />Add Category</Button>
                </div>
              )}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                    <div className="flex items-center text-sm">
                      {renderIcon(category.icon_name)}
                      {category.name} <span className="text-xs text-muted-foreground ml-2">({category.slug})</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingCategory(JSON.parse(JSON.stringify(category)))}><Edit3 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default AdminTagsTab;
  