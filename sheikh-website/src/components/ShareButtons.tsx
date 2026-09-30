import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Link as LinkIcon, Check, Send } from 'lucide-react';
import { sheikhConfig } from '../data/sheikhConfig';

interface ShareButtonsProps {
  url?: string;
  title?: string;
}

export const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || `${sheikhConfig.typeLabel} ${sheikhConfig.name}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' \n' + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-card hover:bg-primary/5 text-primary dark:text-gold border border-border hover:border-gold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md font-bold text-sm"
      >
        <Share2 className="w-4 h-4" />
        مشاركة
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-3 w-64 bg-card border border-border shadow-2xl rounded-2xl p-3 z-50 flex flex-col gap-2"
          >
            <div className="text-xs font-bold text-muted mb-1 text-center">شارك عبر</div>
            
            <div className="grid grid-cols-4 gap-2">
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors">
                <MessageCircleIcon className="w-5 h-5" />
                <span className="text-[10px]">واتساب</span>
              </a>
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors">
                <FacebookIcon className="w-5 h-5" />
                <span className="text-[10px]">فيسبوك</span>
              </a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sky-500 transition-colors">
                <TwitterIcon className="w-5 h-5" />
                <span className="text-[10px]">تويتر</span>
              </a>
              <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors">
                <Send className="w-5 h-5" />
                <span className="text-[10px]">تليجرام</span>
              </a>
            </div>

            <div className="h-px w-full bg-border my-1"></div>
            
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors text-sm font-bold"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-green-500" /> تم النسخ</>
              ) : (
                <><LinkIcon className="w-4 h-4" /> نسخ الرابط</>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for Whatsapp icon since lucide doesn't have it explicitly named sometimes or MessageCircle is used
const MessageCircleIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const FacebookIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
