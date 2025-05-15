
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { PackagePlus, ListChecks, Edit3, Trash2, Search } from 'lucide-react';
    import { 
      getItems as fetchAllItems, 
      updateItem as updateItemService, 
      deleteItem as deleteItemService, 
      generateAndStoreItem as generateItemService 
    } from '@/lib/services/itemService';
    import { seedSampleData as seedDataService } from '@/lib/services/seedService';
    import ItemEditDialog from '@/components/admin/dialogs/ItemEditDialog';
    import Fuse from 'fuse.js';

    const ContentManagementTab = () => {
      const [items, setItems] = useState([]);
      const [filteredItems, setFilteredItems] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedItem, setSelectedItem] = useState(null);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [newItemName, setNewItemName] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();

      const fuse = new Fuse(items, {
        keys: ['name', 'slug', 'tags'],
        threshold: 0.3,
      });

      const loadItems = async () => {
        setIsLoading(true);
        try {
          const fetchedItems = await fetchAllItems();
          setItems(fetchedItems);
          setFilteredItems(fetchedItems);
        } catch (error) {
          toast({ title: "Error", description: "Could not load items.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        loadItems();
      }, []);

      useEffect(() => {
        if (searchTerm === '') {
          setFilteredItems(items);
        } else {
          const results = fuse.search(searchTerm);
          setFilteredItems(results.map(result => result.item));
        }
      }, [searchTerm, items]);


      const handleEditItem = (item) => {
        setSelectedItem(item);
        setIsEditDialogOpen(true);
      };

      const handleDeleteItem = async (itemSlug) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${itemSlug}"? This action cannot be undone.`);
        if (confirmed) {
          setIsLoading(true);
          const success = await deleteItemService(itemSlug);
          if (success) {
            toast({ title: "Item Deleted", description: `"${itemSlug}" has been removed.` });
            loadItems(); // Refresh list
          } else {
            toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
          }
          setIsLoading(false);
        }
      };
      
      const handleSaveItem = async (originalSlug, dataToUpdate) => {
        setIsLoading(true);
        const updated = await updateItemService(originalSlug, dataToUpdate);
        if (updated) {
          toast({ title: "Changes Saved", description: `"${updated.name}" has been updated.` });
          setIsEditDialogOpen(false);
          setSelectedItem(null);
          loadItems(); // Refresh list
        } else {
          toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        }
        setIsLoading(false);
      };

      const handleCreateNewItem = async () => {
        if (!newItemName.trim() || newItemName.trim().length < 2) {
          toast({ title: "Invalid Name", description: "Please enter a valid name (at least 2 characters).", variant: "destructive" });
          return;
        }
        setIsLoading(true);
        toast({ title: "Creating Item", description: "Please wait..."});
        const newItem = await generateItemService(newItemName); // Uses mock AI generation
        if (newItem) {
          toast({ title: "Item Created", description: `"${newItem.name}" created. You can now edit its details.` });
          setNewItemName('');
          loadItems(); // Refresh list
          handleEditItem(newItem); // Open for detailed editing
        } else {
          toast({ title: "Error", description: "Failed to create item. It might already exist or an AI error occurred.", variant: "destructive" });
        }
        setIsLoading(false);
      };

      const handleSeedData = async () => {
        const confirmed = window.confirm("Are you sure you want to seed sample data? This may create duplicates if items already exist.");
        if (confirmed) {
          setIsLoading(true);
          toast({ title: "Seeding Data", description: "Please wait..." });
          await seedDataService();
          toast({ title: "Data Seeded", description: "Sample data has been processed." });
          loadItems(); // Refresh list
          setIsLoading(false);
        }
      };

      return (
        <Card>
          <CardHeader>
            <CardTitle>Manage Content</CardTitle>
            <CardDescription>Add, edit, or delete use case items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                placeholder="Enter new item name for AI generation..." 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-grow"
                disabled={isLoading}
              />
              <Button onClick={handleCreateNewItem} disabled={isLoading || !newItemName.trim()} className="w-full sm:w-auto">
                <PackagePlus className="mr-2 h-4 w-4" /> Create with AI
              </Button>
              <Button variant="outline" onClick={handleSeedData} disabled={isLoading} className="w-full sm:w-auto">
                <ListChecks className="mr-2 h-4 w-4" /> Seed Sample Data
              </Button>
            </div>
            <div className="relative">
              <Input
                placeholder="Search items by name, slug, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {isLoading && <p className="text-center text-muted-foreground py-4">Loading content...</p>}
            {!isLoading && filteredItems.length === 0 && <p className="text-center text-muted-foreground py-4">No items match your search, or no items exist.</p>}
            
            {!isLoading && filteredItems.length > 0 && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-md p-2">
                {filteredItems.map((item) => (
                  <div key={item.id || item.slug} className="flex items-center justify-between p-2 sm:p-3 border-b last:border-b-0 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="truncate mr-2">
                      <h3 className="font-medium text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        Slug: {item.slug} | {item.uses?.length || 0} uses | Tags: {item.tags?.slice(0,3).join(', ') || 'None'}
                        {item.tags?.length > 3 && '...'}
                      </p>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleEditItem(item)} disabled={isLoading}>
                        <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.slug)} disabled={isLoading}>
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                         <span className="sr-only sm:not-sr-only sm:ml-1">Del</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
             {selectedItem && (
              <ItemEditDialog
                isOpen={isEditDialogOpen}
                setIsOpen={setIsEditDialogOpen}
                item={selectedItem}
                onSave={handleSaveItem}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      );
    };
    export default ContentManagementTab;
  