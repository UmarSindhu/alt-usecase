
    import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Card } from '@/components/ui/card';
    import { Trash2, Save, PlusCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const ItemEditDialog = ({ isOpen, setIsOpen, item, onSave, isLoading }) => {
      const [formData, setFormData] = useState({});
      const { toast } = useToast();

      useEffect(() => {
        if (item) {
          setFormData({
            name: item.name || '',
            slug: item.slug || '',
            tags: item.tags ? item.tags.join(', ') : '',
            seo_title: item.seo_title || '',
            seo_description: item.seo_description || '',
            image_url: item.image_url || '',
            og_image_url: item.og_image_url || '',
            canonical_url: item.canonical_url || `/use/${item.slug || ''}`,
            uses: item.uses ? JSON.parse(JSON.stringify(item.uses)) : [], // Deep copy for uses
          });
        } else {
          setFormData({ name: '', slug: '', tags: '', seo_title: '', seo_description: '', uses: [] });
        }
      }, [item, isOpen]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleUseChange = (index, field, value) => {
        const updatedUses = formData.uses.map((use, i) => 
          i === index ? { ...use, [field]: value } : use
        );
        setFormData(prev => ({ ...prev, uses: updatedUses }));
      };

      const addUseField = () => {
        setFormData(prev => ({
          ...prev,
          uses: [...(prev.uses || []), { title: '', description: '', difficulty: 'Easy', image_url: '', affiliate_link: '', votes_yes:0, votes_no:0 }]
        }));
      };
      
      const removeUseField = (index) => {
        setFormData(prev => ({
          ...prev,
          uses: prev.uses.filter((_, i) => i !== index)
        }));
      };

      const handleSubmit = async () => {
        if (!item) return; // Should not happen if dialog is for editing
        
        const dataToSave = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };
        await onSave(item.slug, dataToSave);
      };

      if (!item) return null;

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit Item: {item.name}</DialogTitle>
              <DialogDescription>Make changes to the item details and its use cases. Click save when you're done.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4 py-4 text-sm">
              <div>
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="slug" className="text-xs">Slug (URL part)</Label>
                <Input id="slug" name="slug" value={formData.slug || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="tags" className="text-xs">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" value={formData.tags || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="image_url" className="text-xs">Main Image URL</Label>
                <Input id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="seo_title" className="text-xs">SEO Title</Label>
                <Input id="seo_title" name="seo_title" value={formData.seo_title || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="seo_description" className="text-xs">SEO Description</Label>
                <Textarea id="seo_description" name="seo_description" value={formData.seo_description || ''} onChange={handleInputChange} disabled={isLoading} className="text-sm" />
              </div>
              
              <h4 className="font-semibold pt-3 sm:pt-4 border-t text-base">Use Cases</h4>
              {formData.uses?.map((use, index) => (
                <Card key={index} className="p-3 sm:p-4 space-y-2 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium">Use Case {index + 1}</Label>
                    <Button variant="ghost" size="icon" onClick={() => removeUseField(index)} disabled={isLoading} className="h-7 w-7">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input placeholder="Title" value={use.title || ''} onChange={(e) => handleUseChange(index, 'title', e.target.value)} disabled={isLoading} className="text-sm" />
                  <Textarea placeholder="Description" value={use.description || ''} onChange={(e) => handleUseChange(index, 'description', e.target.value)} disabled={isLoading} className="text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Difficulty (Easy, Medium, Hard)" value={use.difficulty || 'Easy'} onChange={(e) => handleUseChange(index, 'difficulty', e.target.value)} disabled={isLoading} className="text-sm" />
                    <Input placeholder="Image URL (optional)" value={use.image_url || ''} onChange={(e) => handleUseChange(index, 'image_url', e.target.value)} disabled={isLoading} className="text-sm" />
                  </div>
                  <Input placeholder="Affiliate Link (optional)" value={use.affiliate_link || ''} onChange={(e) => handleUseChange(index, 'affiliate_link', e.target.value)} disabled={isLoading} className="text-sm" />
                </Card>
              ))}
              <Button variant="outline" onClick={addUseField} disabled={isLoading} size="sm" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Use Case
              </Button>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ItemEditDialog;
  