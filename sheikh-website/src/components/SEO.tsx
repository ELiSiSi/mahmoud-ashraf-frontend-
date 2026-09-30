import { Helmet } from 'react-helmet-async';
import { sheikhConfig } from '../data/sheikhConfig';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  schema?: any;
}

export const SEO = ({ title, description, image, url, type = 'website', schema }: SEOProps) => {
  const siteTitle = sheikhConfig.name;
  const fullTitle = title ? `${title} | ${siteTitle}` : `${sheikhConfig.typeLabel} ${siteTitle} - ${sheikhConfig.title}`;
  const metaDesc = description || sheikhConfig.bio;
  const metaImage = image || sheikhConfig.seo.defaultImage;
  const metaUrl = url || window.location.href;

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: sheikhConfig.name,
    jobTitle: sheikhConfig.title,
    description: sheikhConfig.bio,
    image: sheikhConfig.seo.defaultImage,
    url: window.location.origin,
    sameAs: [
      sheikhConfig.social.youtube,
      sheikhConfig.social.threads,
      sheikhConfig.social.facebook,
      sheikhConfig.social.tiktok,
      sheikhConfig.social.instagram,
    ].filter(Boolean),
  };

  const finalSchema = schema || baseSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={sheikhConfig.seo.keywords.join(', ')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
};
