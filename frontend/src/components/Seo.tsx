import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, SEO_SITE_URL } from "../lib/seo";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

function withOrigin(origin: string, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

export default function Seo({
  title,
  description,
  path,
  image,
  noindex = false,
}: SeoProps) {
  const injected =
    typeof window !== "undefined"
      ? (
          window as Window & {
            __PRERENDER_INJECTED?: { isPrerender?: boolean };
          }
        ).__PRERENDER_INJECTED
      : undefined;
  const origin =
    injected?.isPrerender ||
    typeof window === "undefined" ||
    !window.location?.origin
      ? SEO_SITE_URL
      : window.location.origin;
  const canonical = withOrigin(origin, path);
  const ogImage = withOrigin(origin, image ?? DEFAULT_OG_IMAGE);
  const robots = noindex ? "noindex,nofollow" : "index,follow";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
