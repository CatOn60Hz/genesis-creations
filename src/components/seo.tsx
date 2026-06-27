import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, type = 'website', image = 'https://genesiskreationsmedia.com/og-image.jpg', url = 'https://genesiskreationsmedia.com/' }: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      {description && <meta property="twitter:description" content={description} />}
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
