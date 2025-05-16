import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Blocks, Package } from 'lucide-react';
import { CATEGORIES as DEFAULT_CATEGORIES_WITH_ICONS } from '@/lib/constants';

const CategoryGrid = ({ categories, showBrowseButton=false }) => {
  const getCategoryIcon = (iconSource) => {
    if (!iconSource) return Package;
    if (typeof iconSource === 'string') {
      const foundCategory = DEFAULT_CATEGORIES_WITH_ICONS.find(cat => 
        (cat.icon.displayName || cat.icon.name) === iconSource
      );
      return foundCategory ? foundCategory.icon : Package;
    }
    return iconSource || Package; 
  };
  
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold flex items-center">
          <Blocks className="mr-3 h-7 w-7 text-primary" />
          Browse by Category
        </h2>
        {showBrowseButton && (
          <Button asChild className="text-md">
            <Link to="/category">Browse All</Link>
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(categories || []).map((category, index) => {
          const IconComponent = getCategoryIcon(category.icon_name || category.icon);
          return (
            <motion.div
              key={category.slug || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="h-full" // Ensure motion div takes full height
            >
              <Button 
                variant="outline" 
                className="w-full h-full min-h-[120px] flex flex-col items-center justify-center hover:bg-primary/10 transition-all duration-300 ease-in-out hover:scale-105 p-4" 
                asChild
              >
                <Link 
                  to={`/category/${category.slug}`}
                  className="flex flex-col items-center justify-center h-full w-full gap-2"
                >
                  {IconComponent && (
                    <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
                  )}
                  <div className="flex flex-col items-center justify-center gap-1 text-center">
                    <span className="font-medium text-sm sm:text-base leading-tight">
                      {category.name}
                    </span>
                    {category.item_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {category.item_count} {category.item_count === 1 ? 'item' : 'items'}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;