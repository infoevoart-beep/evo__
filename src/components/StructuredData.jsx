import { useEffect } from 'react';
import { shareImage, site } from '../data/site';
import { cuisines } from '../data/content';

/**
 * Restaurant schema for search engines. Built at runtime so the absolute
 * URLs always match wherever the site is actually served from, rather than
 * a domain hardcoded at build time.
 */
export function StructuredData() {
  useEffect(() => {
    const origin = window.location.origin;
    const [street, locality] = site.address.split('\n');

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: site.name,
      description: site.tagline,
      url: origin,
      image: new URL(shareImage.src, origin).href,
      telephone: site.phone.href.replace('tel:', ''),
      email: site.email,
      servesCuisine: cuisines.map((c) => c.title),
      address: {
        '@type': 'PostalAddress',
        streetAddress: street,
        addressLocality: locality,
        addressRegion: 'Badulla District',
        addressCountry: 'LK',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 6.7630768, longitude: 80.9053593 },
      hasMap: site.mapsUrl,
      acceptsReservations: true,
    };

    // Search engines ignore an hours block with no times on it, so it is only
    // published once both ends are configured in src/data/site.js.
    const { opens, closes } = site.serviceHours;
    if (opens && closes) {
      data.openingHoursSpecification = {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens,
        closes,
      };
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.hillsedge = 'restaurant';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => script.remove();
  }, []);

  return null;
}

export default StructuredData;
