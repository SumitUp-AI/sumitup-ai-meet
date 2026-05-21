import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";
import SumitupBg from '../../../public/sumitup-typography.svg';

const SiteFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-6">
              <img src={SumitupBg} alt="SumItUp" className="h-8" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
              The AI meeting assistant that respects your privacy. 
              Built for teams that move fast and value clarity.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Integrations', 'Pricing', 'Changelog'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-gray-500 hover:text-primary transition-colors font-light">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'API Reference', 'Community', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-gray-500 hover:text-primary transition-colors font-light">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(/ /g, '-')}`} className="text-gray-500 hover:text-primary transition-colors font-light">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-400 text-sm font-light">
            © {new Date().getFullYear()} SumItUp Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-gray-400">
            <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
