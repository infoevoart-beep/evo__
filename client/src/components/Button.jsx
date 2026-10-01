import { Link } from 'react-router-dom';

/**
 * One button for the whole site. `variant` is fill | ghost | dark; pass
 * `to` for an internal route, `href` for an external link, or neither for
 * a plain <button>.
 */
export function Button({
  variant = 'fill',
  to,
  href,
  children,
  className = '',
  arrow = true,
  ...rest
}) {
  const classes = `btn b-${variant} ${className}`.trim();
  const content = (
    <>
      {children}
      {arrow && <i aria-hidden="true">&rarr;</i>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}

export default Button;
