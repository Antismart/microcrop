import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">MC</span>
              </div>
              <span className="font-bold text-xl">MicroCrop</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Decentralized crop insurance protocol connecting farmers with liquidity providers on Flow blockchain.
            </p>
          </div>

          {/* Protocol */}
          <div className="space-y-4">
            <h3 className="font-semibold">Protocol</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/policies" className="hover:text-primary transition-smooth">Insurance Policies</Link></li>
              <li><Link to="/pools" className="hover:text-primary transition-smooth">Liquidity Pools</Link></li>
              <li><Link to="/weather" className="hover:text-primary transition-smooth">Weather Data</Link></li>
              <li><Link to="/docs" className="hover:text-primary transition-smooth">Documentation</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Whitepaper</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Security Audit</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Bug Bounty</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Help Center</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="font-semibold">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Telegram</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MicroCrop Insurance Protocol. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;