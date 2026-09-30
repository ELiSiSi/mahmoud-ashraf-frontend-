import { useEffect, useState, useRef } from 'react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, PlayCircle, Play, ChevronRight, ChevronLeft,
  Film, Sparkles, Mic, BookOpen, Heart, HelpCircle, Video
} from 'lucide-react';
import { sheikhConfig } from '../data/sheikhConfig';
import { SocialLinks } from '../components/Footer';
import { PrayerTimes } from '../components/PrayerTimes';
import { ShareButtons } from '../components/ShareButtons';
import { SEO } from '../components/SEO';

// ============================================================================
// Types
// ============================================================================
export interface Video {
  id: string;
  url: string;
  title?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  videos: Video[];
}

// ============================================================================
// Category Icon Helper
// ============================================================================
const getCategoryIcon = (id: string, name: string) => {
  const key = (id + ' ' + name).toLowerCase();
  if (key.includes('khutub') || key.includes('خطب')) return Mic;
  if (key.includes('lesson') || key.includes('درس')) return BookOpen;
  if (key.includes('khawatir') || key.includes('خواطر')) return Heart;
  if (key.includes('qa') || key.includes('سؤال') || key.includes('أسئلة') || key.includes('أجوبة')) return HelpCircle;
  return Video;
};

// ============================================================================
// Video Detector
// ============================================================================
const detectVideo = (url: string, overrideOrientation?: 'portrait' | 'landscape' | 'square') => {
  const orientationToRatio = (o: string) =>
    o === 'portrait' ? '9/16' : o === 'square' ? '1/1' : '16/9';

  const applyOverride = (result: any) => {
    if (!overrideOrientation) return result;
    return { ...result, orientation: overrideOrientation, aspectRatio: orientationToRatio(overrideOrientation) };
  };

  if (!url) return applyOverride({ platform: 'other', orientation: 'landscape', embedUrl: '', aspectRatio: '16/9', id: '' });
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let id = '';
      let isShorts = false;
      if (hostname.includes('youtu.be')) id = urlObj.pathname.slice(1);
      else if (urlObj.searchParams.has('v')) id = urlObj.searchParams.get('v') || '';
      else if (urlObj.pathname.startsWith('/embed/')) id = urlObj.pathname.split('/')[2];
      else if (urlObj.pathname.startsWith('/shorts/')) { id = urlObj.pathname.split('/')[2]; isShorts = true; }
      if (id) return applyOverride({
        platform: 'youtube',
        orientation: isShorts ? 'portrait' : 'landscape',
        embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
        aspectRatio: isShorts ? '9/16' : '16/9',
        id,
      });
    }

    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
      const isPortrait = urlObj.pathname.includes('/reel/') || urlObj.pathname.includes('/reels/');
      return applyOverride({
        platform: 'facebook',
        orientation: isPortrait ? 'portrait' : 'landscape',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=800`,
        aspectRatio: isPortrait ? '9/16' : '16/9',
        id: '',
      });
    }

    if (hostname.includes('tiktok.com')) {
      let id = '';
      if (urlObj.pathname.includes('/video/')) id = urlObj.pathname.split('/video/')[1].split('?')[0];
      else if (urlObj.pathname.includes('/v/')) id = urlObj.pathname.split('/v/')[1].split('?')[0];
      if (id) return applyOverride({
        platform: 'tiktok',
        orientation: 'portrait',
        embedUrl: `https://www.tiktok.com/embed/v2/${id}`,
        aspectRatio: '9/16',
        id,
      });
    }

    if (hostname.includes('instagram.com')) {
      let id = '';
      let embedType = 'p';
      if (urlObj.pathname.includes('/p/')) { id = urlObj.pathname.split('/p/')[1].split('/')[0]; embedType = 'p'; }
      else if (urlObj.pathname.includes('/reel/')) { id = urlObj.pathname.split('/reel/')[1].split('/')[0]; embedType = 'reel'; }
      else if (urlObj.pathname.includes('/reels/')) { id = urlObj.pathname.split('/reels/')[1].split('/')[0]; embedType = 'reel'; }
      else if (urlObj.pathname.includes('/tv/')) { id = urlObj.pathname.split('/tv/')[1].split('/')[0]; embedType = 'tv'; }

      if (id) return applyOverride({
        platform: 'instagram',
        orientation: embedType === 'reel' ? 'portrait' : 'square',
        embedUrl: `https://www.instagram.com/${embedType}/${id}/embed/`,
        aspectRatio: embedType === 'reel' ? '9/16' : '1/1',
        id,
      });
    }

    return applyOverride({ platform: 'other', orientation: 'landscape', embedUrl: url, aspectRatio: '16/9', id: '' });
  } catch {
    return applyOverride({ platform: 'other', orientation: 'landscape', embedUrl: url, aspectRatio: '16/9', id: '' });
  }
};

// ============================================================================
// دالة جلب بيانات الفيديو تلقائيًا من الرابط
// ============================================================================
const fetchVideoMetadata = async (url: string): Promise<{ title: string; thumbnail: string }> => {
  const parsed = detectVideo(url);
  const defaultResult = { title: 'فيديو', thumbnail: '' };

  try {
    let oembedUrl = '';
    if (parsed.platform === 'youtube' && parsed.id) {
      oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    }
    else if (parsed.platform === 'tiktok' && parsed.id) {
      oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    }

    if (oembedUrl) {
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || defaultResult.title,
          thumbnail: data.thumbnail_url || defaultResult.thumbnail,
        };
      }
    }
  } catch (error) {
    console.warn('فشل جلب بيانات الفيديو:', url, error);
  }

  if (parsed.platform === 'youtube' && parsed.id) {
    return {
      title: defaultResult.title,
      thumbnail: `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`,
    };
  }

  return defaultResult;
};

// ============================================================================
// Hero
// ============================================================================
const Hero = () => (
  <section className="hero-section" style={{ background: 'var(--gradient-hero)' }}>
    <div className="hero-pattern" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '120px 120px' }}></div>
    <div className="hero-glow"></div>
    <div className="hero-container">
      <div className="hero-layout">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="hero-text-wrapper">
          <div>
            <h2 className="hero-title">{sheikhConfig.title}</h2>
            <div className="hero-divider"></div>
            <h1 className="hero-name">{sheikhConfig.typeLabel} {sheikhConfig.name}</h1>
          </div>
          <p className="hero-bio">{sheikhConfig.bio}</p>
          <div className="hero-social-wrapper"><SocialLinks /></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="hero-image-wrapper">
          <div className="hero-image-container">
            <div className="hero-image-glow"></div>
            <img src={sheikhConfig.heroImage || sheikhConfig.seo.defaultImage} alt={sheikhConfig.name} className="hero-image" />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ============================================================================
// Category Card
// ============================================================================
const CategoryCard = ({ category, index }: { category: Category; index: number }) => {
  const Icon = getCategoryIcon(category.id, category.name);
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Link to={`/category/${category.id}`} className="category-card">
        <motion.div whileHover={{ scale: 1.03 }} className="category-card-inner group">
          <div className="category-card-img-wrapper">
            <img src={category.image} alt={category.name} className="category-card-img" />
          </div>
          <div className="category-card-overlay group-hover:from-black/90 group-hover:via-black/40"></div>
          <div className="category-card-border"></div>
          <div className="category-card-badge">
            <Play className="w-4 h-4 fill-current" />
            {category.videos?.length || 0} فيديو
          </div>
          <div className="category-card-content">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 backdrop-blur-sm border border-gold/50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gold" strokeWidth={2} />
              </div>
              <h3 className="category-card-title">{category.name}</h3>
            </div>
            <div className="category-card-divider"></div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// Home Page
// ============================================================================
export const Home = () => {
  const totalVideos = sheikhConfig.categories?.reduce((sum, c) => sum + (c.videos?.length || 0), 0) || 0;
  const totalCategories = sheikhConfig.categories?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <SEO />
      <Hero />
      <PrayerTimes />

      <section className="bg-card border-y border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light mb-1">{totalVideos}+</div>
              <div className="text-sm text-muted">فيديو تعليمي</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light mb-1">{totalCategories}</div>
              <div className="text-sm text-muted">سلاسل علمية</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light mb-1">{sheikhConfig.yearsInField}+</div>
              <div className="text-sm text-muted">{sheikhConfig.fieldLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary dark:text-primary-light mb-1">{sheikhConfig.certificates?.length || 0}</div>
              <div className="text-sm text-muted">إجازات علمية</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-10 md:mb-14 text-center md:text-right">
          <h2 className="text-3xl md:text-5xl font-amiri font-bold text-primary dark:text-primary-light mb-4 flex items-center justify-center md:justify-start gap-3">
            <span className="text-gold">❖</span> السلاسل العلمية
          </h2>
          <div className="w-20 h-1.5 bg-gold mx-auto md:mx-0 rounded-full"></div>
          <p className="text-muted mt-4 text-base md:text-lg">تصفح السلاسل واختر المحتوى المناسب لك</p>
        </div>

        {sheikhConfig.categories && sheikhConfig.categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {sheikhConfig.categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <Sparkles className="w-16 h-16 text-gold mx-auto mb-4" />
            <p className="text-2xl font-amiri text-muted mb-2">المحتوى قريباً إن شاء الله</p>
            <p className="text-muted">تابعنا على السوشيال ميديا ليصلك كل جديد</p>
          </div>
        )}
      </main>
    </motion.div>
  );
};

// ============================================================================
// Series Page — مع Scroll ذكي + مشغل الفيديو
// ============================================================================
const SeriesPage = () => {
  const { id, videoId } = useParams();
  const navigate = useNavigate();
  const [iframeError, setIframeError] = useState(false);

  // ✅ ref لمكان مشغل الفيديو
  const videoPlayerRef = useRef<HTMLDivElement>(null);

  const [videosMetadata, setVideosMetadata] = useState<Record<string, { title: string; thumbnail: string }>>({});

  const series = sheikhConfig.categories?.find(c => c.id === id);
  const currentIndex = videoId && series ? series.videos.findIndex(v => v.id === videoId) : -1;
  const currentVideo = currentIndex >= 0 && series ? series.videos[currentIndex] : null;
  const parsedVideo = currentVideo ? detectVideo(currentVideo.url, currentVideo.orientation) : null;
  const hasNext = currentIndex >= 0 && series ? currentIndex < series.videos.length - 1 : false;
  const hasPrev = currentIndex > 0;

  // جلب بيانات كل الفيديوهات
  useEffect(() => {
    if (!series) return;
    let isMounted = true;

    const loadAllMetadata = async () => {
      const metadata: Record<string, { title: string; thumbnail: string }> = {};
      await Promise.all(
        series.videos.map(async (v) => {
          const data = await fetchVideoMetadata(v.url);
          metadata[v.id] = {
            title: v.title || data.title,
            thumbnail: data.thumbnail,
          };
        })
      );
      if (isMounted) setVideosMetadata(metadata);
    };

    loadAllMetadata();
    return () => { isMounted = false; };
  }, [series]);

  // ✅ scroll ذكي: لمكان الفيديو (لو فيديو مختار) أو لأعلى الصفحة (لو سلسلة جديدة)
  useEffect(() => {
    setIframeError(false);

    // نستخدم setTimeout عشان ندي وقت للـ DOM إنه يتحدّث ويرندر الـ ref
    const timer = setTimeout(() => {
      if (videoId && videoPlayerRef.current) {
        // فيه فيديو مختار → scroll لمكان الفيديو
        const yOffset = -90; // مسافة للنافبار الثابت
        const element = videoPlayerRef.current;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (!videoId) {
        // سلسلة جديدة بدون فيديو → scroll لأعلى الصفحة
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [id, videoId]);

  if (!series) return <Navigate to="/" replace />;

  const Icon = getCategoryIcon(series.id, series.name);
  const playVideo = (vId: string) => navigate(`/category/${id}/video/${vId}`);

  const getVideoTitle = (video: Video) => video.title || videosMetadata[video.id]?.title || '...';
  const getVideoThumbnail = (video: Video) => videosMetadata[video.id]?.thumbnail || series.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-6 md:py-12"
    >
      <SEO title={series.name} description={`فيديوهات سلسلة ${series.name}`} type="article" />

      {/* ✅ على الموبايل: بدون padding أفقي للفيديو. على الديسكتوب: فيه padding */}
      <div className="max-w-6xl mx-auto md:px-4 sm:px-6 lg:px-8">

        {/* ============ Back Link ============ */}
        <div className="px-4 md:px-0">
          <Link to="/" className="inline-flex items-center text-primary dark:text-gold hover:underline mb-6 font-bold text-base md:text-lg">
            <ArrowRight className="w-5 h-5 ml-2" /> العودة للرئيسية
          </Link>
        </div>

        {/* ============ Series Header ============ */}
        <div className="mx-4 md:mx-0 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-card p-6 md:p-8 rounded-3xl shadow-lg border border-border">
            <div className="relative flex-shrink-0">
              <img
                src={series.image}
                alt={series.name}
                className="w-32 h-32 md:w-56 md:h-56 object-cover rounded-2xl shadow-xl border-4 border-gold"
              />
              <div className="absolute -bottom-3 -right-3 bg-primary text-white font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-xl shadow-lg border-2 border-gold text-xs md:text-sm">
                {series.videos.length} فيديو
              </div>
            </div>
            <div className="text-center md:text-right flex-grow">
              <div className="inline-flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-gold" strokeWidth={2} />
                </div>
                <span className="text-xs md:text-sm font-bold text-gold uppercase tracking-wider">سلسلة علمية</span>
              </div>
              <h1 className="text-2xl md:text-5xl font-amiri font-bold text-primary dark:text-primary-light mb-3 md:mb-4">
                {series.name}
              </h1>
              <div className="w-20 h-1 bg-gold rounded-full mx-auto md:mx-0 mb-4"></div>
              <ShareButtons
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={`سلسلة: ${series.name}`}
              />
            </div>
          </div>
        </div>

        {/* ============ Video Player — يظهر فقط لما فيديو مختار ============ */}
        {currentVideo && parsedVideo && (
          <motion.div
            ref={videoPlayerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 md:mb-10 scroll-mt-24"
          >
            {/* 
              * على الموبايل: full width (بدون padding أفقي)
              * على الديسكتوب: مقيّد حسب الـ orientation
            */}
            <div
              className={`relative mx-auto bg-black overflow-hidden shadow-2xl md:rounded-2xl md:border-2 md:border-gold ${
                parsedVideo.orientation === 'portrait'
                  ? 'w-full md:max-w-[520px]'
                  : parsedVideo.orientation === 'square'
                    ? 'w-full md:max-w-[680px]'
                    : 'w-full md:max-w-[900px]'
              }`}
              style={{
                aspectRatio: parsedVideo.aspectRatio,
                maxHeight: parsedVideo.orientation === 'portrait' ? '85vh' : 'none',
              }}
            >
              {!iframeError ? (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={getVideoTitle(currentVideo)}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onError={() => setIframeError(true)}
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <Film className="w-16 h-16 text-gold mb-4" />
                  <p className="text-xl font-bold mb-2">الفيديو مش متاح حالياً</p>
                  <p className="text-white/70 text-sm">جرّب فيديو تاني من السلسلة</p>
                </div>
              )}
            </div>

            {/* Video Title + Share */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 mt-4 md:mt-5 mb-4 md:mb-5 px-4 md:px-0 w-full md:max-w-[900px] mx-auto">
              <h2 className="text-base md:text-2xl font-bold text-primary dark:text-gold leading-relaxed text-center md:text-right flex-1">
                {getVideoTitle(currentVideo)}
              </h2>
              <div className="shrink-0">
                <ShareButtons
                  url={typeof window !== 'undefined' ? window.location.href : ''}
                  title={`${series.name} - ${getVideoTitle(currentVideo)}`}
                />
              </div>
            </div>

            {/* ✅ Prev / Next Buttons — أصغر على الموبايل */}
            {(hasPrev || hasNext) && (
              <div className="flex justify-center gap-2 md:gap-3 mb-6 md:mb-8 px-4 md:px-0">
                {hasPrev && (
                  <button
                    onClick={() => playVideo(series.videos[currentIndex - 1].id)}
                    className="flex items-center gap-1.5 md:gap-2 bg-primary hover:bg-primary-light text-white px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all shadow-md hover:shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /> السابق
                  </button>
                )}
                {hasNext && (
                  <button
                    onClick={() => playVideo(series.videos[currentIndex + 1].id)}
                    className="flex items-center gap-1.5 md:gap-2 bg-primary hover:bg-primary-light text-white px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-base transition-all shadow-md hover:shadow-lg"
                  >
                    التالي <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="w-full h-px bg-gold/30 mb-6 md:mb-8"></div>
          </motion.div>
        )}

        {/* ============ Videos List ============ */}
        {series.videos.length > 0 && (
          <div className="px-4 md:px-0">
            <h3 className="font-amiri text-xl md:text-3xl font-bold mb-5 md:mb-6 text-text flex items-center gap-2">
              <span className="text-gold">❖</span> {currentVideo ? 'كل فيديوهات السلسلة' : 'فيديوهات السلسلة'}
            </h3>

            <div className="flex flex-col gap-2.5 md:gap-3">
              {series.videos.map((v, idx) => {
                const isCurrent = v.id === videoId;
                const thumbnail = getVideoThumbnail(v);
                const title = getVideoTitle(v);

                return (
                  <motion.div
                    key={v.id}
                    whileHover={{ x: isCurrent ? 0 : -4 }}
                    onClick={() => !isCurrent && playVideo(v.id)}
                    className={`group flex items-center gap-3 md:gap-4 rounded-xl shadow-sm transition-all border p-2.5 md:p-4 ${
                      isCurrent
                        ? 'bg-gradient-to-l from-primary/10 to-primary/5 border-gold shadow-lg cursor-default'
                        : 'bg-card hover:bg-primary/5 border-border hover:border-gold cursor-pointer hover:shadow-lg'
                    }`}
                  >
                    {/* Number Badge */}
                    <div className="hidden sm:flex w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center flex-shrink-0 text-xs md:text-sm font-bold text-primary dark:text-gold">
                      {idx + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className={`w-24 h-16 md:w-36 md:h-22 flex-shrink-0 bg-gray-200 dark:bg-gray-800 rounded-lg relative overflow-hidden ${isCurrent ? 'ring-2 ring-gold' : ''}`}>
                      <img
                        src={thumbnail}
                        alt=""
                        className={`w-full h-full object-cover transition-transform duration-500 ${!isCurrent ? 'group-hover:scale-105' : ''}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = series.image; }}
                      />
                      <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                        isCurrent ? 'bg-gold/20' : 'bg-black/40 group-hover:bg-black/20'
                      }`}>
                        {isCurrent ? (
                          <div className="flex items-end gap-0.5 h-6">
                            <span className="w-1 bg-gold rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }}></span>
                            <span className="w-1 bg-gold rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }}></span>
                            <span className="w-1 bg-gold rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }}></span>
                            <span className="w-1 bg-gold rounded-full animate-pulse" style={{ height: '80%', animationDelay: '450ms' }}></span>
                          </div>
                        ) : (
                          <PlayCircle className="w-7 h-7 md:w-10 md:h-10 text-gold" strokeWidth={1.8} />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-xs md:text-lg line-clamp-2 leading-relaxed transition-colors ${
                        isCurrent
                          ? 'text-primary dark:text-gold'
                          : 'text-text group-hover:text-primary dark:group-hover:text-gold'
                      }`}>
                        {title}
                      </h4>
                      {isCurrent && (
                        <div className="mt-1.5 md:mt-2">
                          <span className="text-[10px] md:text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/30">
                            ▶ بيتشغل الآن
                          </span>
                        </div>
                      )}
                    </div>

                    {!isCurrent && (
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Exports
// ============================================================================
export const CategoryPage = SeriesPage;
export const VideoPage = SeriesPage;