
    import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { getRandomItem, getRecentItems } from '@/lib/services/itemService';
    import { getCategoriesWithCounts as fetchCategories } from '@/lib/services/categoryService';
    import HeroSearch from '@/components/home/HeroSearch';
    import CategoryGrid from '@/components/home/CategoryGrid';
    import FeaturedItemsGrid from '@/components/home/FeaturedItemsGrid';
    import { Button } from '@/components/ui/button';
    import { useNavigate } from 'react-router-dom';
    import { RefreshCw } from 'lucide-react'; // For "Surprise Me"
    import { useToast } from '@/components/ui/use-toast';

    const HomePage = () => {
      const [items, setItems] = useState([]);
      const [categories, setCategories] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const navigate = useNavigate();
      const { toast } = useToast();

      const loadData = async () => {
        setIsLoading(true);
        try {
          const [fetchedItems, fetchedCategories] = await Promise.all([
            getRecentItems(),
            fetchCategories(10)
          ]);
          setItems(fetchedItems);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("Error fetching homepage data:", error);
          toast({
            title: "Error",
            description: "Could not load data. Please try refreshing.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      useEffect(() => {
        loadData();
      }, []);
      
      const handleSearchItemsUpdate = (updatedItems) => {
        setItems(updatedItems);
      };

      const handleSurpriseMe = async () => {
        toast({ title: "Finding a surprise..."});
        const randomItem = await getRandomItem();
        if (randomItem) {
          navigate(`/use/${randomItem}`);
        } else {
          toast({ title: "Oops!", description: "Couldn't find an item to surprise you with right now.", variant: "destructive"});
        }
      };


      return (
        <>
          <Helmet>
            <title>Alt Use Case - Discover Alternative Uses</title>
            <meta name="description" content="Search for any object, tool, or skill and discover alternative, creative, or practical use cases." />
          </Helmet>

          <motion.div 
            className="space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-xl shadow-lg">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 px-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Unlock <span className="gradient-text">Alternative Uses</span>
              </motion.h1>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Enter any object, tool, or skill and discover a world of creative and practical possibilities.
              </motion.p>
              <HeroSearch onSearchItemsUpdate={handleSearchItemsUpdate} />
               <Button onClick={handleSurpriseMe} variant="ghost" className="mt-4 text-primary hover:text-primary/80">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin-slow" /> Surprise Me!
              </Button>
            </section>

            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <CategoryGrid categories={categories} showBrowseButton={true} />
                <FeaturedItemsGrid items={items} />
              </>
            )}
          </motion.div>
        </>
      );
    };

    export default HomePage;
  