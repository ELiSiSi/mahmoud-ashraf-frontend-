import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowUp, Home, User, Mail, MessageCircle } from 'lucide-react';
import { sheikhConfig } from '../data/sheikhConfig';

// ============================================================================
// SocialLinks
// ============================================================================
export const SocialLinks = ({ context = 'hero' }: { context?: 'hero' | 'footer' | 'profile' }) => {
  const { social } = sheikhConfig;
  const links = [
    { name: 'youtube', url: social.youtube, icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { name: 'facebook', url: social.facebook, icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'instagram', url: social.instagram, icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.07M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { name: 'tiktok', url: social.tiktok, icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.51.76-5.33 2.96-6.61 1.5-.88 3.31-1.06 4.96-.53.11.04.22.09.33.15v4.32c-.5-.14-1.03-.2-1.55-.14-.73.08-1.45.42-1.92 1-.46.57-.68 1.3-.65 2.03.04.9.45 1.74 1.15 2.31.75.61 1.76.85 2.7.67.92-.17 1.75-.72 2.24-1.5.34-.53.53-1.15.57-1.78.04-3.79.02-7.57.02-11.36 0-1.87-.01-3.73-.01-5.6z' },
    { name: 'threads', url: social.threads, icon: 'M14.07 19.349c-1.568.901-3.472.967-5.276.233-1.432-.587-2.658-1.734-3.309-3.157-1.184-2.596-1.184-6.254 0-8.85.65-1.424 1.876-2.571 3.309-3.157 2.723-1.134 6.093-.554 8.357 1.192 1.514 1.166 2.495 2.919 2.674 4.847h-2.392c-.366-2.288-2.564-3.871-5.034-3.385-1.654.325-2.968 1.581-3.329 3.229-.32 1.457-.064 2.949.701 4.197.867 1.41 2.41 2.213 4.052 2.136 1.606-.075 3.069-.984 3.83-2.38.517-.946.604-2.058.24-3.051-.375-1.028-1.26-1.816-2.344-2.027-1.151-.225-2.333.207-3.001 1.154-.107.152-.12.355-.033.516.087.162.26.257.445.255h2.069c.438-.005.791.354.782.791-.016.745-.583 1.346-1.329 1.406-.856.069-1.659-.452-1.965-1.262-.187-.493-.167-1.033.052-1.508.354-.767 1.09-1.288 1.915-1.404 1.398-.197 2.744.754 3.101 2.109.34 1.296-.104 2.683-1.16 3.506-1.222.951-2.942 1.153-4.363.505-1.904-.869-3.109-2.964-2.992-5.075.145-2.611 2.295-4.601 4.917-4.684 2.339-.073 4.411 1.46 5.019 3.691.343 1.259.256 2.606-.245 3.805-.775 1.857-2.482 3.162-4.481 3.457l-.21 2.911z' },
    { name: 'email', url: social.email, icon: 'M12 12.713l11.985-8.71C23.517 2.03 21.849 1 20 1H4C2.152 1 .484 2.03.015 4.003L12 12.713zm0 2.574L0 6.577V20c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V6.577l-12 8.71z' }
  ];

  if (context === 'footer') {
    return (
      <div className="footer-social-grid">
        {links.map((link) => link.url && (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -4, scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="footer-social-btn"
          >
            <svg viewBox="0 0 24 24"><path d={link.icon} /></svg>
          </motion.a>
        ))}
      </div>
    );
  }

  if (context === 'profile') {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map((link) => link.url && (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-xl bg-primary/10 hover:bg-primary border-2 border-primary/30 hover:border-gold flex items-center justify-center transition-all"
          >
            <svg className="w-6 h-6 fill-primary dark:fill-gold" viewBox="0 0 24 24">
              <path d={link.icon} />
            </svg>
          </motion.a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {links.map((link) => link.url && (
        <motion.a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link-hero"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-[26px] h-[26px] fill-current" viewBox="0 0 24 24">
            <path d={link.icon} />
          </svg>
        </motion.a>
      ))}
    </div>
  );
};

// ============================================================================
// Scroll to Top Button — يظهر بس عند التمرير
// ============================================================================
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // يظهر بعد ما المستخدم يعمل scroll 300 بكسل
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          className="scroll-to-top-btn"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Footer
// ============================================================================
export const Footer = () => {
  return (
    <>
      <footer className="footer-container">
        {/* Pattern */}
        <div
          className="footer-pattern"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        ></div>

        {/* Glow */}
        <div className="footer-glow"></div>

        <div className="footer-content">
          {/* ============ Main Grid ============ */}
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col-brand">
              <Link to="/" className="footer-brand">
                <div className="footer-brand-icon">
                  <span>❖</span>
                </div>
                <div>
                  <h3 className="footer-brand-name">{sheikhConfig.name}</h3>
                  <p className="footer-brand-title">{sheikhConfig.title}</p>
                </div>
              </Link>
              <p className="footer-brand-bio">{sheikhConfig.bio}</p>
              <div className="footer-brand-social">
                <SocialLinks context="footer" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">روابط سريعة</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/" className="footer-link">
                    <Home className="w-4 h-4" />
                    <span>الرئيسية</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="footer-link">
                    <User className="w-4 h-4" />
                    <span>عن {sheikhConfig.typeLabel}</span>
                  </Link>
                </li>
                {sheikhConfig.social.email && (
                  <li>
                    <a href={sheikhConfig.social.email} className="footer-link">
                      <Mail className="w-4 h-4" />
                      <span>تواصل معنا</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Series */}
            <div className="footer-col">
              <h4 className="footer-col-title">السلاسل</h4>
              <ul className="footer-links">
                {sheikhConfig.categories?.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.id}`} className="footer-link">
                      <span className="footer-link-bullet">◂</span>
                      <span className="footer-link-text">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============ Divider ============ */}
          <div className="footer-divider">
            <span className="footer-divider-line"></span>
            <span className="footer-divider-star">✦</span>
            <span className="footer-divider-line"></span>
          </div>

          {/* ============ Bottom ============ */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              جميع الحقوق محفوظة © {new Date().getFullYear()}{' '}
              <span className="footer-copyright-name">
                {sheikhConfig.typeLabel} {sheikhConfig.name}
              </span>
            </p>
            <p className="footer-made-with">
              صُنع بـ <Heart className="w-4 h-4 fill-red-400 text-red-400 inline mx-1" /> للدعوة إلى الله
            </p>
          </div>
        </div>
      </footer>

      {/* ✅ زرار العودة للأعلى — خارج الفوتر عشان يكون ثابت */}
      <ScrollToTopButton />
    </>
  );
};