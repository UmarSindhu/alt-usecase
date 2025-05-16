import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateAndStoreItem as generateItemService, getItems as getAllItems } from '@/lib/services/itemService';
import AdPlaceholder from '@/components/AdPlaceholder';

const HeroSearch = ({ onSearchItemsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialItems = async () => {
      const items = await getAllItems();
      setAllItems(items);
    };
    fetchInitialItems();

    const queryParam = searchParams.get('search');
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, []); 

  const fuse = useMemo(() => {
    if (allItems.length === 0) return null;
    return new Fuse(allItems, {
      keys: ['name'],
      threshold: 0.3, 
    });
  }, [allItems]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setIsSearching(term.length > 0);

    if (term.trim() === '') {
      setSearchResults([]);
      setSearchParams({}); 
      return;
    }

    if (fuse) {
      const results = fuse.search(term.trim()).map(result => result.item);
      setSearchResults(results);
      setSearchParams({ search: term }); 
    }
  };
  
  const handleGenerateItem = async () => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      toast({
        title: "Invalid Search Term",
        description: "Please enter at least 3 characters to generate content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast({
      title: "AI Magic in Progress!",
      description: `Generating alternative uses for "${searchTerm}"...`,
      duration: Infinity // Keep toast open until manually dismissed
    });

    try {
      const newItem = await generateItemService(searchTerm);
      if (newItem) {
        loadingToast.dismiss();
        toast({
          title: "Success!",
          description: `"${newItem.name}" has been added. Redirecting...`,
          variant: "default",
          duration: 3000
        });
        const updatedItems = await getAllItems(); 
        setAllItems(updatedItems); 
        if (onSearchItemsUpdate) {
          onSearchItemsUpdate(updatedItems); 
        }
        setSearchTerm(''); 
        setIsSearching(false); 
        setSearchResults([]);
        navigate(`/use/${newItem.slug}`); 
      } else {
        loadingToast.dismiss();
        toast({
          title: "Generation Failed",
          description: "Could not generate content. The item might already exist or an AI error occurred.",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Error generating item in HeroSearch:", error);
      loadingToast.dismiss();
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating content. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Overlay when generating */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="max-w-xl mx-auto relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="relative">
          <Input
            type="search"
            placeholder="e.g., 'banana peel', 'Excel', 'duct tape'..."
            className="h-12 text-lg pl-12 py-3 rounded-full shadow-md focus:shadow-lg transition-shadow"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isGenerating}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          {/* {searchTerm.length >= 3 && searchResults.length === 0 && isSearching && (
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-xs sm:text-sm px-2 sm:px-3"
              onClick={handleGenerateItem}
              size="sm"
              disabled={isGenerating}
            >
              <Wand2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Generate
            </Button>
          )} */}
        </div>

        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute w-full mt-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl border border-border/40 overflow-hidden z-50"
            >
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                  {searchResults.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/use/${item.slug}`}
                      className="flex items-start p-3 sm:p-4 hover:bg-accent/80 transition-colors border-b border-border/40 last:border-0"
                      onClick={() => {
                          setIsSearching(false);
                          setSearchTerm(''); 
                      }}
                    >
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2">
                          {item.uses && item.uses.length > 0 ? item.uses[0]?.description : 'Discover amazing alternative uses.'}
                        </p>
                        <div className="mt-1 sm:mt-2 flex flex-wrap gap-1">
                          {item.tags && item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchTerm.length > 0 && (
                <div className="p-4 text-center">
                  {!isGenerating && (<p className="text-sm text-muted-foreground mb-2">Oops! can't find "{searchTerm.trim()} in our Database"</p>
                  )}
                  {searchTerm.length >= 3 && (
                    <Button 
                      onClick={handleGenerateItem} 
                      className="w-full"
                      disabled={isGenerating}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isGenerating ? 'AI Search in progress. Please wait..' : 'Search using our AI'}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AdPlaceholder slotKey="ad_slot_homepage_hero_bottom_enabled" defaultText="Hero Ad Spot" className="h-32 mt-8 max-w-2xl mx-auto" />
    </>
  );
};

export default HeroSearch;