
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import AdPlaceholder from '@/components/AdPlaceholder';

const FeaturedItemsGrid = ({ items }) => {
  return (
    <section>
      <h2 className="text-3xl font-semibold mb-6 flex items-center">
        <Zap className="mr-3 h-7 w-7 text-primary" />
        Featured Use Cases
      </h2>
      <AdPlaceholder slotKey="ad_slot_homepage_featured_top_enabled" defaultText="Featured Ad Spot" className="h-32 mb-6" />
      {items && items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300 ease-in-out group flex flex-col">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">{item.name}</CardTitle>
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
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No featured items available at the moment. Check back soon!</p>
      )}
    </section>
  );
};

export default FeaturedItemsGrid;
