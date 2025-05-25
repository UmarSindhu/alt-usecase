import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
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
      const [tagsRes, categoriesRes] = await Promise.all([
        fetch('/api/service/admin?op=tags'),
        fetch('/api/service/admin?op=categories')
      ]);

      if (!tagsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [tagsData, categoriesData] = await Promise.all([
        tagsRes.json(),
        categoriesRes.json()
      ]);

      setTags(tagsData);
      setCategories(categoriesData);
    } catch (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const response = await fetch('/api/service/admin?op=addTag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setNewTagName('');
      fetchData();
      toast({ title: "Success", description: "Tag added successfully" });
    } catch (error) {
      toast({ title: "Error adding tag", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    try {
      const response = await fetch('/api/service/admin?op=updateTag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTag)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setEditingTag(null);
      fetchData();
      toast({ title: "Success", description: "Tag updated successfully" });
    } catch (error) {
      toast({ title: "Error updating tag", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const response = await fetch('/api/service/admin?op=deleteTag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tagId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchData();
      toast({ title: "Success", description: "Tag deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting tag", description: error.message, variant: "destructive" });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) return;
    try {
      const response = await fetch('/api/service/admin?op=addCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setNewCategory({ name: '', slug: '', description: '', icon_name: 'Default' });
      fetchData();
      toast({ title: "Success", description: "Category added successfully" });
    } catch (error) {
      toast({ title: "Error adding category", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const response = await fetch('/api/service/admin?op=updateCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setEditingCategory(null);
      fetchData();
      toast({ title: "Success", description: "Category updated successfully" });
    } catch (error) {
      toast({ title: "Error updating category", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch('/api/service/admin?op=deleteCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchData();
      toast({ title: "Success", description: "Category deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    }
  };

  const renderIcon = (iconName) => {
    const Icon = iconMap[iconName] || iconMap.Default;
    return <Icon className="h-4 w-4 mr-2 text-primary" />;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><TagIcon className="mr-2 h-5 w-5 text-primary" />Tags</CardTitle>
          <CardDescription>Manage item tags</CardDescription>
        </CardHeader>
        <CardContent>
          {editingTag ? (
            <div className="space-y-3 p-3 border rounded-md mb-4">
              <h4 className="font-medium">Edit Tag</h4>
              <Input value={editingTag.name} onChange={(e) => setEditingTag({...editingTag, name: e.target.value})} />
              <div className="flex gap-2">
                <Button onClick={handleUpdateTag}><Save className="h-4 w-4 mr-1" />Save</Button>
                <Button variant="outline" onClick={() => setEditingTag(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 border rounded-md mb-4">
              <h4 className="font-medium">Add New Tag</h4>
              <div className="flex gap-2">
                <Input placeholder="Tag Name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                <Button onClick={handleAddTag}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                <span className="text-sm">{tag.name}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditingTag(JSON.parse(JSON.stringify(tag)))}><Edit3 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTag(tag.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5 text-primary" />Categories</CardTitle>
          <CardDescription>Manage item categories</CardDescription>
        </CardHeader>
        <CardContent>
          {editingCategory ? (
            <div className="space-y-3 p-3 border rounded-md mb-4">
              <h4 className="font-medium">Edit Category</h4>
              <div><Label htmlFor="edit-cat-name">Name</Label><Input id="edit-cat-name" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} /></div>
              <div><Label htmlFor="edit-cat-slug">Slug</Label><Input id="edit-cat-slug" value={editingCategory.slug} onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} /></div>
              <div><Label htmlFor="edit-cat-desc">Description</Label><Input id="edit-cat-desc" value={editingCategory.description || ''} onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})} /></div>
              <div><Label htmlFor="edit-cat-icon">Icon Name</Label>
                <select id="edit-cat-icon" value={editingCategory.icon_name} onChange={(e) => setEditingCategory({...editingCategory, icon_name: e.target.value})} className="w-full p-2 border rounded-md bg-background">
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
  