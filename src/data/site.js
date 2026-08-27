import { images } from './images';

export const site = {
  name: 'Hillsedge Beragala',
  tagline: 'A mountain smokehouse and dining destination in Beragala, Sri Lanka — smoke, flavour and nature, in one place.',
  region: 'Beragala · Sri Lanka Hill Country',
  coordinates: '6.7631° N, 80.9054° E',
  hours: 'Lunch & dinner, daily',
  phone: { label: '074 237 3394', href: 'tel:+94742373394' },
  whatsapp: '94742373394',
  email: 'hello@hillsedgeberagala.com',
  address: 'Bathgoda, Kalupahana Waththa,\nHaldummulla 90180',
  mapsUrl: 'https://maps.app.goo.gl/22pMrv7L8VWsPGweA',
  mapEmbedUrl: 'https://maps.google.com/maps?q=6.7630768,80.9053593&z=15&output=embed',
};

/** Single source of truth for the header, the mobile sheet and the footer. */
export const navLinks = [
  { to: '/', label: 'Home', sheetLabel: 'Home', index: '01' },
  { to: '/about', label: 'About', sheetLabel: 'About', index: '02' },
  { to: '/smokehouse', label: 'Smokehouse', sheetLabel: 'Smokehouse', index: '03' },
  { to: '/cuisine', label: 'Cuisine', sheetLabel: 'Cuisine', index: '04' },
  { to: '/gallery', label: 'Gallery', sheetLabel: 'Gallery', index: '05' },
  { to: '/visit', label: 'Visit', sheetLabel: 'Visit & Reserve', index: '06' },
];

export const footerColumns = [
  {
    heading: 'Explore',
    links: navLinks.slice(0, 5).map(({ to, label }) => ({ to, label })),
  },
  {
    heading: 'Visit',
    links: [
      { to: '/visit', label: 'Location' },
      { to: '/visit#reserve', label: 'Reservations' },
      { href: site.mapsUrl, label: 'Google Maps', external: true },
      { to: '/visit', label: 'Opening hours' },
    ],
  },
  {
    heading: 'Contact',
    links: [
      { href: site.phone.href, label: site.phone.label },
      { href: `mailto:${site.email}`, label: site.email },
      { label: 'Beragala, Sri Lanka', static: true },
    ],
  },
];

export const socialLinks = [
  { label: 'Instagram', href: '#', icon: 'instagram' },
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'WhatsApp', href: `https://wa.me/${site.whatsapp}`, icon: 'whatsapp' },
];

/**
 * Every photograph used anywhere on the site, with its caption and gallery
 * category. Pages pick from this list by key rather than re-declaring alt
 * text and captions of their own.
 */
export const photos = {
  pathDusk: {
    ...images.pathDusk,
    alt: 'Lantern-lit garden path leading up to the Hillsedge Beragala lodge at dusk, framed by hills',
    caption: 'The walk up, at dusk',
    category: 'place',
  },
  smoker: {
    ...images.smoker,
    alt: 'The hand-built offset smoker at Hillsedge Beragala, set against timber posts and clay walls',
    caption: 'The smoker',
    category: 'smoke',
  },
  sunsetValley: {
    ...images.sunsetValley,
    alt: 'Sunset over the layered hills and valleys seen from Hillsedge Beragala',
    caption: 'Sunset over the valley',
    category: 'views',
  },
  diningHall: {
    ...images.diningHall,
    alt: 'Guests dining beneath the tall timber roof of the dining hall',
    caption: 'The dining hall',
    category: 'place',
  },
  goldenHourTable: {
    ...images.goldenHourTable,
    alt: 'Smokehouse plates set on a table overlooking the valley at golden hour',
    caption: 'Golden hour at the table',
    category: 'table',
  },
  underTheStars: {
    ...images.underTheStars,
    alt: 'The Hillsedge lodge lit up beneath a starry night sky',
    caption: 'Under the stars',
    category: 'place',
  },
  sundowners: {
    ...images.sundowners,
    alt: 'A chilled cocktail on the deck as the sun sets over the valley',
    caption: 'Sundowners on the deck',
    category: 'table',
  },
  waterfallRoad: {
    ...images.waterfallRoad,
    alt: 'Waterfall on the mountain road to Beragala',
    caption: 'On the road up',
    category: 'views',
  },
  timberThatch: {
    ...images.timberThatch,
    alt: 'The thatched roof and timber frame of the Hillsedge lodge against a clear hill-country sky',
    caption: 'Timber, stone and thatch',
    category: 'place',
  },
  deckDinner: {
    ...images.deckDinner,
    alt: 'A plated smokehouse dish and drinks on the open deck as the sun sets over the valley',
    caption: 'Dinner as the valley turns gold',
    category: 'table',
  },
  litPathway: {
    ...images.litPathway,
    alt: 'Lit stone pathway climbing towards the Hillsedge lodge at dusk',
    caption: 'Pathways lit from dusk',
    category: 'place',
  },
  afterDark: {
    ...images.afterDark,
    alt: 'The Hillsedge lodge glowing under warm lights after dark',
    caption: 'After dark',
    category: 'place',
  },
  signboard: {
    ...images.signboard,
    alt: 'The thatched Hillsedge Beragala signboard on the hill road',
    caption: "You'll know it when you see it",
    category: 'views',
  },
};

export default site;
