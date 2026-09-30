import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';
import axios from 'axios';
import { sheikhConfig } from '../data/sheikhConfig';

// ============================================================================
// Hooks
// ============================================================================
const useAthkar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!sheikhConfig.athkar || sheikhConfig.athkar.length === 0) return;
    const savedIndex = localStorage.getItem('lastAthkarIndex');
    if (savedIndex !== null) setCurrentIndex(parseInt(savedIndex) % sheikhConfig.athkar.length);
    let intervalId: any;
    let prayerVisible = false;
    let lastPrayerHideTime = 0;

    const handlePrayerVisibility = (e: any) => {
      prayerVisible = e.detail.isVisible;
      if (prayerVisible) {
        setIsVisible(false);
      } else {
        lastPrayerHideTime = Date.now();
      }
    };
    window.addEventListener('prayerVisibilityChanged', handlePrayerVisibility);

    const showToast = () => {
      if (prayerVisible) return;
      if (Date.now() - lastPrayerHideTime < 5000) return; // wait 5s after prayer toast hides

      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % sheikhConfig.athkar.length;
          localStorage.setItem('lastAthkarIndex', nextIndex.toString());
          return nextIndex;
        });
      }, sheikhConfig.settings.athkarDuration);
    };

    const initialTimeout = setTimeout(() => {
      showToast();
      intervalId = setInterval(showToast, sheikhConfig.settings.athkarInterval);
    }, 3500);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('prayerVisibilityChanged', handlePrayerVisibility);
    };
  }, []);

  if (!sheikhConfig.athkar || sheikhConfig.athkar.length === 0) return { thikr: null, isVisible: false };
  return { thikr: sheikhConfig.athkar[currentIndex], isVisible };
};

const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string> | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{name: string, time: string, originalName: string} | null>(null);
  const [reminderState, setReminderState] = useState<'none' | 'upcoming' | 'current'>('none');
  
  const arabicPrayers: Record<string, string> = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const { city, country } = sheikhConfig.settings;
        const response = await axios.get(`https://api.aladhan.com/v1/timingsByCity`, { params: { city, country, method: 5 } });
        setPrayerTimes(response.data.data.timings);
      } catch (error) { console.error(error); }
    };
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const checkTimes = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      let foundNext = false;
      const nowMins = currentHours * 60 + currentMinutes;
      
      for (const prayer of prayers) {
        const timeStr = prayerTimes[prayer];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMins = h * 60 + m;
        
        if (prayerMins > nowMins && prayerMins - nowMins <= 15) {
          setNextPrayer({ name: arabicPrayers[prayer], time: timeStr, originalName: prayer });
          setReminderState('upcoming');
          foundNext = true;
          break;
        }
        
        if (nowMins >= prayerMins && nowMins - prayerMins <= 30) {
          const prayedDate = localStorage.getItem(`prayed_${prayer}_${now.toDateString()}`);
          if (!prayedDate) {
            setNextPrayer({ name: arabicPrayers[prayer], time: timeStr, originalName: prayer });
            setReminderState('current');
            foundNext = true;
            break;
          }
        }
      }
      if (!foundNext) setReminderState('none');
    };
    checkTimes();
    const interval = setInterval(checkTimes, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  const markPrayed = (prayerOriginalName: string) => {
    localStorage.setItem(`prayed_${prayerOriginalName}_${new Date().toDateString()}`, 'true');
    setReminderState('none');
  };
  return { prayerTimes, nextPrayer, reminderState, markPrayed };
};

const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) return localStorage.getItem('theme') || 'light';
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    if (theme) localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  return { theme, toggleTheme };
};


// ============================================================================
// Components
// ============================================================================

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="theme-toggle-btn">
      {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  );
};

const AthkarTicker = () => {
  const { thikr, isVisible } = useAthkar();
  
  return (
    <AnimatePresence>
      {isVisible && thikr && (
        <motion.div 
          initial={{ opacity: 0, x: 50, scale: 0.9 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          exit={{ opacity: 0, x: 50, scale: 0.9 }} 
          transition={{ type: 'spring', stiffness: 300, damping: 25 }} 
          className="athkar-toast-wrapper"
        >
          <div className="athkar-toast-content">
             <div className="flex-1">
               <p className="athkar-toast-text">
                 {thikr}
               </p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PrayerReminder = () => {
  const { nextPrayer, reminderState, markPrayed } = usePrayerTimes();
  if (reminderState === 'none' || !nextPrayer) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="prayer-modal-wrapper">
        <div className="prayer-modal-content">
          <div className="prayer-modal-icon">
            <span className="text-gold text-2xl">🕌</span>
          </div>
          {reminderState === 'upcoming' ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">اقترب موعد صلاة {nextPrayer.name}</h3>
              <p className="text-gold font-bold text-2xl">{nextPrayer.time}</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">حان الآن موعد صلاة {nextPrayer.name}</h3>
              <button onClick={() => markPrayed(nextPrayer.originalName)} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-bold transition-colors w-full">تمت الصلاة بفضل الله</button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="header-nav">
      <div className="header-nav-container">
        <div className="header-nav-content">
          <div className="header-logo-wrapper">
            <Link to="/" className="header-logo-link group">
              <span className="header-logo-text">
                {sheikhConfig.name}
              </span>
            </Link>
          </div>
          <div className="header-desktop-menu">
            <NavLink to="/" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`} end>الرئيسية</NavLink>
            <NavLink to="/profile" className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}>عن {sheikhConfig.typeLabel}</NavLink>
            <ThemeToggle />
          </div>
          <div className="header-mobile-menu-btn">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-text hover:text-primary focus:outline-none">
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="header-mobile-dropdown">
          <div className="px-4 py-6 space-y-4">
            <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 text-lg font-bold rounded-xl transition-colors ${isActive ? 'bg-primary-lighter text-primary' : 'text-text hover:bg-primary-lighter hover:text-primary'}`} end>الرئيسية</NavLink>
            <NavLink to="/profile" onClick={() => setIsOpen(false)} className={({ isActive }) => `block px-4 py-3 text-lg font-bold rounded-xl transition-colors ${isActive ? 'bg-primary-lighter text-primary' : 'text-text hover:bg-primary-lighter hover:text-primary'}`}>عن {sheikhConfig.typeLabel}</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};


export const Header = () => (
  <>
    <AthkarTicker />
    <Navbar />
    <PrayerReminder />
  </>
);
