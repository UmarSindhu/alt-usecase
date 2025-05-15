import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Linkedin, Info, Lightbulb, Zap } from 'lucide-react';
import AdPlaceholder from '@/components/AdPlaceholder';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background/50 border-t border-border/40">
      <div className="container mx-auto px-4 py-8">
        <AdPlaceholder slotKey="ad_slot_footer_enabled" defaultText="Footer Ad" className="h-24 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 gradient-text">AltUse</h3>
            <p className="text-sm text-muted-foreground">
              Discover creative and practical alternative uses for everyday items.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Zap size={16} className="mr-2" />Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Info size={16} className="mr-2" />About Us</Link></li>
              <li><Link to="/suggestions" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Lightbulb size={16} className="mr-2" />Suggestions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Connect</h4>
            <div className="flex space-x-3">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Github size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <div className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} AltUseCase. All rights reserved. Built By <a href="https://sindhusolutions.com" target="_blank">Sindhu Solutions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
