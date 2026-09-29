import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home, CategoryPage, VideoPage } from './pages/Home';
import { SheikhProfile } from './pages/Profile';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/category/:id/video/:videoId" element={<VideoPage />} />
            <Route path="/profile" element={<SheikhProfile />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}
