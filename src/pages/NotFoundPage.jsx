
    import React from 'react';
    import { Link } from 'react-router-dom';
    import { Helmet } from 'react-helmet-async';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle, Home } from 'lucide-react';
    import { motion } from 'framer-motion';

    const NotFoundPage = () => {
      return (
        <>
          <Helmet>
            <title>404 - Page Not Found | Alt Use Case</title>
          </Helmet>
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AlertTriangle className="h-24 w-24 text-destructive mb-8 animate-bounce" />
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-6">Oops! Page Not Found</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              The page you're looking for doesn't seem to exist. Maybe it was moved, or you mistyped the URL.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Go Back Home
              </Link>
            </Button>
          </motion.div>
        </>
      );
    };

    export default NotFoundPage;
  