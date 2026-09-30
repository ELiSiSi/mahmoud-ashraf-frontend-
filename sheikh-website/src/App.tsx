import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home, CategoryPage, VideoPage } from './pages/Home';
import { SheikhProfile } from './pages/Profile';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/category/:id/video/:videoId" element={<VideoPage />} />
        <Route path="/profile" element={<SheikhProfile />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <AnimatedRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}
