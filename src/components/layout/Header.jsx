
    import React, { useState, useEffect } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Search, Moon, Sun, Zap, Menu, X, Wand2, Info, Lightbulb } from 'lucide-react';
    import { useTheme } from '@/components/ThemeProvider';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { getItems, getRandomItem, generateAndStoreItem } from '@/lib/useCaseService';
    import { SearchCommand } from '@/components/SearchCommand';
    import AdPlaceholder from '@/components/AdPlaceholder';
    import { useAuth } from '@/hooks/useAuth';

    const Header = () => {
      const { isAuthenticated } = useAuth();
      const [searchTerm, setSearchTerm] = useState('');
      const [isSearchOpen, setIsSearchOpen] = useState(false);
      const navigate = useNavigate();
      const { theme, setTheme } = useTheme();
      const { toast } = useToast();
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      
      const handleSearch = (e) => {
        e.preventDefault();
        setIsSearchOpen(true);
      };

      const handleGenerate = async () => {
        if (!searchTerm.trim() || searchTerm.trim().length < 3) {
          toast({
            title: "Invalid Search",
            description: "Please enter at least 3 characters to generate content.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Generating Content",
          description: `Creating alternative uses for "${searchTerm}"...`
        });

        try {
          const newItem = await generateAndStoreItem(searchTerm);
          if (newItem) {
            navigate(`/use/${newItem.slug}`);
            setSearchTerm('');
          } else {
            toast({
              title: "Generation Failed",
              description: "Could not generate content. The item might already exist.",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to generate content. Please try again.",
            variant: "destructive"
          });
        }
      };

      const handleSurpriseMe = () => {
        const randomItem = getRandomItem();
        if (randomItem) {
          navigate(`/use/${randomItem.slug}`);
        } else {
          toast({
            title: "No items available",
            description: "Could not find an item to surprise you with.",
            variant: "destructive",
          });
        }
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      };
      
      const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
      };

      const navLinks = [
        { name: 'Home', path: '/', icon: null },
        { name: 'About', path: '/about', icon: <Info className="mr-2 h-4 w-4" /> },
        { name: 'Suggestions', path: '/suggestions', icon: <Lightbulb className="mr-2 h-4 w-4" /> },
      ];

      return (
        <>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg gradient-text">AltUse</span>
            </Link>
            
            <div className="hidden md:flex flex-grow items-center space-x-4">
              <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
                <Input
                  type="search"
                  placeholder="Search for an item (e.g., 'socks')..."
                  className="pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => setIsSearchOpen(true)}
                />
                <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <nav className="flex items-center space-x-1">
                {navLinks.filter(link => link.name === 'About' || link.name === 'Suggestions').map(link => (
                   <Button key={link.name} variant="ghost" asChild>
                     <Link to={link.path}>{link.icon}{link.name}</Link>
                   </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <Button variant="ghost" asChild>
                  <Link to="/manage">
                    <Wand2 className="mr-2 h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleSurpriseMe} className="hidden sm:inline-flex">
                <Zap className="mr-2 h-4 w-4" /> Surprise Me
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          <SearchCommand open={isSearchOpen} setOpen={setIsSearchOpen} />

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border/40 bg-background/95"
              >
                <div className="container py-4 px-4 space-y-4">
                  <form onSubmit={handleSearch} className="relative w-full">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={() => setIsSearchOpen(true)}
                    />
                    <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  <nav className="flex flex-col space-y-2">
                    {navLinks.map(link => (
                       <Button key={link.name} variant="ghost" className="justify-start" asChild onClick={() => setIsMobileMenuOpen(false)}>
                         <Link to={link.path}>{link.name}</Link>
                       </Button>
                    ))}
                  </nav>
                  <Button variant="outline" onClick={handleSurpriseMe} className="w-full">
                    <Zap className="mr-2 h-4 w-4" /> Surprise Me
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
        <AdPlaceholder slotKey="ad_slot_header_enabled" defaultText="Header Ad" className="h-16 container max-w-screen-xl mx-auto" />
        </>
      );
    };

    export default Header;
  