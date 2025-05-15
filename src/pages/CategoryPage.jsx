import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import { getItemsByCategory } from '@/lib/services/itemService';
import { getCategories } from '@/lib/services/categoryService';
import { CATEGORIES as DEFAULT_CATEGORIES_WITH_ICONS } from '@/lib/constants';
import AdPlaceholder from '@/components/AdPlaceholder';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedCategories = await getCategories();
      const currentCategory = fetchedCategories.find(c => c.slug === categoryName);
      setCategory(currentCategory);

      if (currentCategory) {
        const categoryItems = await getItemsByCategory(categoryName);
        setItems(categoryItems);
      }
      setLoading(false);
    };
    fetchData();
  }, [categoryName]);
  
  const getCategoryIconComponent = (iconSource) => {
    if (!iconSource) return Package;
    if (typeof iconSource === 'string') { // icon_name from DB
          const foundCat = DEFAULT_CATEGORIES_WITH_ICONS.find(cat => (cat.icon.displayName || cat.icon.name) === iconSource);
          return foundCat ? foundCat.icon : Package;
    }
    return iconSource; // Already a component from constants/direct state
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">The category "{categoryName}" does not exist.</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back Home
          </Link>
        </Button>
      </div>
    );
  }
  
  const IconComponent = getCategoryIconComponent(category.icon_name || category.icon);

  return (
    <>
      <Helmet>
        <title>{category.name} | Alt Use Case</title>
        <meta name="description" content={`Discover alternative uses for items in the ${category.name} category.`} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <Button variant="outline" asChild className="mb-6 print:hidden">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </Link>
        </Button>

        <header className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          {IconComponent && <IconComponent className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{category.name}</h1>
            {category.description && <p className="text-sm sm:text-base text-muted-foreground">{category.description}</p>}
          </div>
        </header>

        <AdPlaceholder slotKey="ad_slot_category_page_top_enabled" defaultText="Category Page Top Ad" className="h-28 mb-6" />

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <React.Fragment key={item.slug}>
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 ease-in-out group flex flex-col">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors text-xl sm:text-2xl">{item.name}</CardTitle>
                      <CardDescription>{item.uses?.length || 0} alternative uses</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {item.uses && item.uses.length > 0 ? item.uses[0]?.description : 'Discover amazing alternative uses.'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.tags && item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                      <Button asChild className="w-full group-hover:bg-primary/90 transition-colors">
                        <Link to={`/use/${item.slug}`}>View Uses</Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
                {(index + 1) % 5 === 0 && index < items.length -1 && (
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300 ease-in-out group flex flex-col">
                      <AdPlaceholder slotKey="ad_slot_category_page_inlist_enabled" defaultText={`In-List Ad Spot ${Math.floor(index/6)+1}`} className="h-full my-0" />
                    </Card>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10 text-base sm:text-lg">
            No items found in the {category.name} category yet. Be the first to add one!
          </p>
        )}
      </motion.div>
    </>
  );
};

export default CategoryPage;
