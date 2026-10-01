import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { shareImage, site } from '../data/site';
import { navLinks } from '../data/routes';
import { cuisines, faqs, nearbyLandmarks } from '../data/content';

/**
 * Machine-readable facts for search engines and answer engines.
 *
 * Built at runtime so the absolute URLs always match wherever the site is
 * actually served from, rather than a domain hardcoded at build time.
 *
 * Three graphs are published:
 *
 *  - Restaurant, the entity itself. This is what a "restaurants near me"
 *    result is assembled from.
 *  - BreadcrumbList, so a result shows Home › Visit rather than a bare URL.
 *  - FAQPage on the visit page. Both Google and the LLM-backed answer engines
 *    lift these questions and answers more or less verbatim, so the six
 *    already written for guests are worth marking up properly.
 */
export function StructuredData() {
  const { pathname } = useLocation();

  useEffect(() => {
    const origin = window.location.origin;
    const [street, locality] = site.address.split('\n');
    const image = new URL(shareImage.src, origin).href;

    const restaurant = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      '@id': `${origin}/#restaurant`,
      name: site.name,
      description: site.tagline,
      url: origin,
      image,
      telephone: site.phone.href.replace('tel:', ''),
      email: site.email,
      servesCuisine: cuisines.map((c) => c.title),
      priceRange: '$$',
      currenciesAccepted: 'LKR',
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
      // The catchment is what people actually search from, not a radius.
      areaServed: [
        'Beragala',
        'Haputale',
        'Ella',
        'Bandarawela',
        'Koslanda',
        'Haldummulla',
        'Badulla District',
        'Uva Province',
      ].map((name) => ({ '@type': 'Place', name })),
      // Attributes that decide a booking: parking for coaches, the view,
      // and the dietary range. Stated only where the site already says so.
      amenityFeature: [
        { name: 'On-site parking, including coaches', value: true },
        { name: 'Outdoor seating', value: true },
        { name: 'Valley views', value: true },
        { name: 'Vegetarian options', value: true },
        { name: 'Vegan options', value: true },
        { name: 'Group and set menus', value: true },
      ].map((a) => ({ '@type': 'LocationFeatureSpecification', ...a })),
      publicAccess: true,
      smokingAllowed: false,
      isAccessibleForFree: true,
    };

    // Search engines ignore an hours block with no times on it, so it is only
    // published once both ends are configured in src/data/site.js.
    const { opens, closes } = site.serviceHours;
    if (opens && closes) {
      restaurant.openingHoursSpecification = {
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

    const graphs = [restaurant];

    // Breadcrumbs: home, then this page if it is a real route.
    const current = navLinks.find((link) => link.to === pathname);
    if (current && pathname !== '/') {
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
          {
            '@type': 'ListItem',
            position: 2,
            name: current.label,
            item: `${origin}${current.to}`,
          },
        ],
      });
    }

    if (pathname === '/visit') {
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      });

      // What is around us, with the distance stated. This is the fact an
      // answer engine needs to place us against "near Diyaluma Falls".
      graphs.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Attractions near ${site.name}`,
        itemListElement: nearbyLandmarks.map((landmark, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'TouristAttraction',
            name: landmark.name,
            description: `${landmark.text} ${landmark.distance} by road, ${landmark.time.toLowerCase()} from ${site.name}.`,
          },
        })),
      });
    }

    const nodes = graphs.map((data) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.hillsedge = data['@type'].toLowerCase();
      /*
       * Setting textContent on a detached element does not go through the
       * HTML parser, so a "</script>" in the data cannot break out here. The
       * escape is belt-and-braces for the day this markup is server-rendered
       * or serialised, where it would: JSON.stringify leaves "<" alone.
       */
      script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
      document.head.appendChild(script);
      return script;
    });

    return () => nodes.forEach((node) => node.remove());
  }, [pathname]);

  return null;
}

export default StructuredData;
