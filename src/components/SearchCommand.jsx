import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { FileText, Wand2, Zap } from 'lucide-react';
import { getItems as fetchAllItems, generateAndStoreItem, getRandomItem as fetchRandomItem } from '@/lib/services/itemService';
import { useToast } from '@/components/ui/use-toast';
import Fuse from 'fuse.js';

export function SearchCommand({ open, setOpen }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fuseInstance = useMemo(() => {
    if (allItems.length === 0) return null;
    return new Fuse(allItems, {
      keys: ['name'],
      threshold: 0.4,
      includeScore: true,
      shouldSort: true,
    });
  }, [allItems]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    const items = await fetchAllItems();
    setAllItems(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (open) loadItems();
  }, [open, loadItems]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }
    if (fuseInstance) {
      const results = fuseInstance.search(term.trim()).map(result => result.item)
      setSearchResults(results);
    }
  }

  const shouldShowGenerate = useMemo(() => {
    return searchTerm.length >= 3 && searchResults.length === 0;
  }, [searchTerm, searchResults]);

  const runCommand = useCallback((command) => {
    setOpen(false);
    command();
  }, [setOpen]);

  const handleGenerate = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 3) {
      toast({
        title: "Invalid Search Term",
        description: "Please enter at least 3 characters to generate content.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    const loadingToast = toast({
      title: "AI Magic in Progress!",
      description: `Generating alternative uses for "${searchTerm}"...`,
      duration: Infinity // Keep toast open until manually dismissed
    });
    const newItem = await generateAndStoreItem(searchTerm);
    setIsLoading(false);
    if (newItem) {
      loadingToast.dismiss();
      toast({
        title: "Success!",
        description: `"${newItem.name}" has been added. Redirecting...`,
        variant: "default",
        duration: 3000
      });
      runCommand(() => navigate(`/use/${newItem.slug}`));
      await loadItems();
    } else {
      loadingToast.dismiss();
      toast({
        title: "Generation Failed",
        description: "Could not generate content. The item might already exist or an AI error occurred.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    toast({ title: "Finding a surprise..." });
    const randomItem = await fetchRandomItem();
    setIsLoading(false);
    if (randomItem) {
      runCommand(() => navigate(`/use/${randomItem}`));
    } else {
      toast({ 
        title: "Oops!", 
        description: "Couldn't find a random item.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search items or type commands..."
        value={searchTerm}
        onValueChange={handleSearch}
        disabled={isLoading}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center">
              AI Search in progress
              <span className="ml-2 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
            </div>
          ) :
            (searchTerm.trim().length >= 3 ? (
              <div className="py-6 text-center text-sm">
                Oops! can't find "{searchTerm.trim()}" in our Database.
                  <Button 
                    variant="link" 
                    onClick={handleGenerate} 
                    className="mt-2 text-primary hover:text-primary/80" 
                    disabled={isLoading}
                  >
                    <Wand2 className="mr-2 h-4 w-4" /> Search using our AI
                  </Button>
              </div>
            ) : "Type to search items or use commands")
          }
        </CommandEmpty>
        
        {searchResults.length > 0 && (
          <CommandGroup heading="Matching Items">
            {searchResults.map((item) => (
              <CommandItem
                key={item.slug}
                value={item.name}
                onSelect={() => runCommand(() => navigate(`/use/${item.slug}`))}
                className="flex justify-between items-center"
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </div>
                {item.tags?.length > 0 && (
                  <div className="ml-auto flex gap-1">
                    {item.tags.slice(0,2).map(tag => (
                      <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(searchResults.length > 0 || searchTerm.length > 0) && <CommandSeparator />}

        <CommandGroup heading="Actions">
          <CommandItem onSelect={handleSurpriseMe} disabled={isLoading}>
            <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
            Surprise Me (Random Item)
          </CommandItem>
          {shouldShowGenerate && (
            <CommandItem onSelect={handleGenerate} disabled={isLoading}>
              <Wand2 className="mr-2 h-4 w-4 text-muted-foreground" />
              Generate "{searchTerm}" Uses
            </CommandItem>
          )}
        </CommandGroup>
        
        {allItems.length > 0 && searchTerm.length < 2 && searchResults.length === 0 && !isLoading && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recently Added">
              {allItems
                .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 3)
                .map((item) => (
                  <CommandItem
                    key={item.slug}
                    onSelect={() => runCommand(() => navigate(`/use/${item.slug}`))}
                    disabled={isLoading}
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}