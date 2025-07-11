
    import React from 'react';
    import Header from '@/components/layout/Header';
    import Footer from '@/components/layout/Footer';
    import { motion } from 'framer-motion';

    const MainLayout = ({ children }) => {
      return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30 dark:from-background dark:to-secondary/10">
          <Header />
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-grow container mx-auto px-4 py-8"
          >
            {children}
          </motion.main>
          <Footer />
        </div>
      );
    };

    export default MainLayout;
  