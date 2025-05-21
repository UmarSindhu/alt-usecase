import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';
import { getCategoriesWithCounts as fetchCategories } from '@/lib/services/categoryService';
import CategoryGrid from '@/components/home/CategoryGrid';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const fetchedCategories = await fetchCategories();
    setCategories(fetchedCategories);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <>
      <Helmet>
        <title>Alt Use Case | Browser All Categories</title>
        <meta name="description" content="Browse Alt Use Case (AUC) categories. Our mission is to uncover hidden potential in everyday items, and how we're building a community of creative problem-solvers." />
        <link rel="canonical" href="https://altusecase.com/category" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 dark:from-primary/5 dark:to-secondary/5 rounded-xl shadow-lg">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <Blocks className="mx-auto h-20 w-20 text-primary mb-6" />
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl font-bold pb-4 mb-4 gradient-text"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            All Categories
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            All use cases and items are carefully pushed under the below categories. Happy Exploring!
          </motion.p>
        </section>
        {loading ? (
          <div className="flex justify-center items-center min-h-200px]">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <CategoryGrid categories={categories} />
        )}
      </motion.div>
    </>
  );
};

export default CategoriesPage;
