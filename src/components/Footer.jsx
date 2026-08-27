import { Link } from 'react-router-dom';
import { footerColumns, site } from '../data/site';
import { BrandMark } from './BrandMark';
import { SocialIcons } from './SocialIcons';

function FooterLink({ link }) {
  if (link.static) return <span>{link.label}</span>;
  if (link.to) return <Link to={link.to}>{link.label}</Link>;
  return (
    <a
      href={link.href}
      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {link.label}
    </a>
  );
}

export function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer>
      <div className="wrap">
        <div className="ft">
          <div className="ft-brand">
            <Link to="/" aria-label={`${site.name} — home`}>
              <BrandMark variant="full" />
            </Link>
            <p>{site.tagline}</p>
            <SocialIcons />
          </div>

          {footerColumns.map(({ heading, links }) => (
            <div key={heading}>
              <h4>{heading}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fb">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <button type="button" className="top" onClick={scrollTop}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
