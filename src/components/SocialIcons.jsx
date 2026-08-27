import { socialLinks } from '../data/site';

const glyphs = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r=".9" />
    </>
  ),
  facebook: <path d="M14 9h3V6h-3a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9a1 1 0 0 1 1-1Z" />,
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.8A7.5 7.5 0 1 1 8.7 19Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5" />
    </>
  ),
};

export function SocialIcons() {
  return (
    <div className="soc">
      {socialLinks.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          aria-label={label}
          {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {glyphs[icon]}
          </svg>
        </a>
      ))}
    </div>
  );
}

export default SocialIcons;
