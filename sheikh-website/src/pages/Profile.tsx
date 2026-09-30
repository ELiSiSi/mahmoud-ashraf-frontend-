import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, BookOpen, Award, GraduationCap, MapPin,
  MessageCircle, Mail, Calendar, Briefcase, User
} from 'lucide-react';
import { sheikhConfig } from '../data/sheikhConfig';
import { SocialLinks } from '../components/Footer';
import { SEO } from '../components/SEO';

// ============================================================================
// Visitor Counter Hook
// ============================================================================
const useVisitorCount = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const savedCount = localStorage.getItem('visitorCount');
    const newCount = savedCount ? parseInt(savedCount) + 1 : 12450;
    localStorage.setItem('visitorCount', newCount.toString());
    setCount(newCount);
  }, []);
  return count;
};

// ============================================================================
// Info Card Component
// ============================================================================
const InfoCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | string[];
  icon: React.ElementType;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="profile-info-card group"
  >
    <div className="profile-info-card-head">
      <div className="profile-info-card-icon">
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <h4 className="profile-info-card-label">{label}</h4>
    </div>
    {Array.isArray(value) ? (
      <ul className="profile-info-card-list">
        {value.map((v, i) => (
          <li key={i} className="profile-info-card-list-item">
            <span className="profile-info-card-list-dot"></span>
            <span>{v}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="profile-info-card-value">{value}</p>
    )}
  </motion.div>
);

// ============================================================================
// Main Component
// ============================================================================
export const SheikhProfile = () => {
  const visitorCount = useVisitorCount();

  // Pattern SVG for background
  const patternSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%230F2E5C' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="profile-page-wrapper"
    >
      <SEO title="الملف الشخصي" type="profile" />
      {/* Background pattern */}
      <div
        className="profile-pattern"
        style={{ backgroundImage: patternSvg, backgroundSize: '120px 120px' }}
      ></div>

      <div className="profile-content-container">
        {/* ================= HERO ================= */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="profile-hero"
        >
          <div className="profile-hero-glow"></div>
          <div className="profile-hero-inner">
            {/* Image */}
            <div className="profile-hero-image-col">
              <div className="profile-hero-image-wrapper">
                <div className="profile-hero-image-ring">
                  <img
                    src={sheikhConfig.heroImage}
                    alt={sheikhConfig.name}
                    className="profile-hero-image"
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="profile-hero-text-col">
              <span className="profile-hero-eyebrow">
                <span>❖</span>
                <span>الملف الشخصي</span>
              </span>
              <h1 className="profile-hero-name">
                {sheikhConfig.typeLabel} {sheikhConfig.name}
              </h1>
              <h2 className="profile-hero-title">{sheikhConfig.title}</h2>
              <div className="profile-hero-divider"></div>
              <p className="profile-hero-bio">{sheikhConfig.bio}</p>

              {/* Mini Stats */}
              <div className="profile-stats-row">
                <div className="profile-stat-mini">
                  <div className="profile-stat-mini-icon">
                    <Calendar className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="profile-stat-mini-content">
                    <span className="profile-stat-mini-value">
                      {sheikhConfig.yearsInField}+
                    </span>
                    <span className="profile-stat-mini-label">
                      {sheikhConfig.fieldLabel}
                    </span>
                  </div>
                </div>

                <div className="profile-stat-mini">
                  <div className="profile-stat-mini-icon">
                    <Award className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="profile-stat-mini-content">
                    <span className="profile-stat-mini-value">
                      {sheikhConfig.certificates?.length || 0}
                    </span>
                    <span className="profile-stat-mini-label">شهادة وإجازة</span>
                  </div>
                </div>

                <div className="profile-stat-mini">
                  <div className="profile-stat-mini-icon">
                    <Eye className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="profile-stat-mini-content">
                    <span className="profile-stat-mini-value">
                      {visitorCount.toLocaleString('ar-EG')}
                    </span>
                    <span className="profile-stat-mini-label">زائر للموقع</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ================= BIO ================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="profile-section"
        >
          <div className="profile-section-header">
            <div className="profile-section-icon-box">
              <User className="w-6 h-6" strokeWidth={2} />
            </div>
            <h2 className="profile-section-title">نبذة تعريفية</h2>
            <div className="profile-section-line"></div>
          </div>

          <div className="profile-bio">
            <span className="profile-bio-quote">❝</span>
            <p className="profile-bio-text">{sheikhConfig.bioLong}</p>
          </div>
        </motion.section>

        {/* ================= INFO GRID ================= */}
        <section className="profile-section">
          <div className="profile-section-header">
            <div className="profile-section-icon-box">
              <BookOpen className="w-6 h-6" strokeWidth={2} />
            </div>
            <h2 className="profile-section-title">معلومات تفصيلية</h2>
            <div className="profile-section-line"></div>
          </div>

          <div className="profile-info-grid">
            <InfoCard
              icon={GraduationCap}
              label="المؤهل العلمي"
              value={sheikhConfig.education}
            />
            <InfoCard
              icon={Briefcase}
              label={sheikhConfig.fieldLabel}
              value={`${sheikhConfig.yearsInField} سنوات`}
            />
            <InfoCard
              icon={MapPin}
              label="الموقع"
              value={sheikhConfig.location}
            />
            {sheikhConfig.customFields?.map((field, idx) => (
              <InfoCard
                key={idx}
                icon={BookOpen}
                label={field.label}
                value={field.value}
              />
            ))}
          </div>
        </section>

        {/* ================= CERTIFICATES ================= */}
        {sheikhConfig.certificates && sheikhConfig.certificates.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="profile-section"
          >
            <div className="profile-section-header">
              <div className="profile-section-icon-box">
                <Award className="w-6 h-6" strokeWidth={2} />
              </div>
              <h2 className="profile-section-title">الإجازات والشهادات</h2>
              <div className="profile-section-line"></div>
            </div>

            <div className="profile-cert-timeline">
              {sheikhConfig.certificates.map((cert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="profile-cert-item"
                >
                  <div className="profile-cert-number">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <p className="profile-cert-text">{cert}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ================= CONTACT ================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="profile-contact-section"
        >
          <h2 className="profile-contact-title">تواصل معنا</h2>
          <p className="profile-contact-subtitle">
            تقدر تتواصل مع {sheikhConfig.typeLabel} {sheikhConfig.name} من خلال المنصات دي
          </p>

          <div className="profile-contact-buttons">
            {sheikhConfig.social.whatsapp && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={sheikhConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-btn-primary"
              >
                <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
                واتساب
              </motion.a>
            )}

            {sheikhConfig.social.email && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={sheikhConfig.social.email}
                className="profile-btn-secondary"
              >
                <Mail className="w-6 h-6" strokeWidth={2.5} />
                إيميل
              </motion.a>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex justify-center mt-8">
            <SocialLinks context="profile" />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};