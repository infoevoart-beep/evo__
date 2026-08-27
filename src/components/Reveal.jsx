import { useReveal } from '../hooks/useReveal';

/**
 * Scroll-in wrapper. `motion` picks the entry direction:
 * flat | up | left | right | none.
 */
export function Reveal({
  as: Tag = 'div',
  motion = 'flat',
  delay,
  className = '',
  children,
  ...rest
}) {
  const [ref, visible] = useReveal();
  const classes = ['d3', `d3-${motion}`, visible ? 'in' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      className={classes}
      style={delay ? { transitionDelay: delay, ...rest.style } : rest.style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
