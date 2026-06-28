import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE_ORIGIN = 'https://genesiskreationsmedia.com';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  image?: string;
  /** Override the canonical URL. Defaults to the current route's absolute URL. */
  url?: string;
  /** Keep this route out of search indexes (e.g. admin). */
  noindex?: boolean;
}

export function SEO({ title, description, type = 'website', image = `${SITE_ORIGIN}/og-image.jpg`, url, noindex = false }: SEOProps) {
  // Derive the canonical from the actual route so every page points at itself
  // (the previous default canonicalised — and og:url'd — every page to the
  // homepage). pathname carries no query string, so the API cache-buster never
  // leaks in.
  const { pathname } = useLocation();
  const canonical = url ?? `${SITE_ORIGIN}${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={title} />
      {description && <meta property="twitter:description" content={description} />}
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={title} />
    </Helmet>
  );
}
