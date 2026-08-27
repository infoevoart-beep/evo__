/**
 * A photograph, served at a sensible size.
 *
 * Emits the WebP ladder as a `<source>` with the original JPEG as the `<img>`
 * fallback, and always sets intrinsic width/height so the browser reserves the
 * right box and the page does not jump as images arrive.
 *
 * `sizes` should describe how wide the image renders at each breakpoint — the
 * browser needs it to pick a candidate before layout. The default assumes a
 * full-bleed image.
 */
export function Picture({
  photo,
  sizes = '100vw',
  priority = false,
  className,
  style,
  imgRef,
  ...rest
}) {
  const loading = priority ? 'eager' : 'lazy';

  // React 18 passes through only the lowercase spelling of this attribute,
  // and warns on any unknown prop even when its value is undefined — so it
  // is added conditionally rather than set to undefined.
  const priorityHint = priority ? { fetchpriority: 'high' } : {};

  return (
    // `picture` is display:contents, so styling and refs belong on the img.
    <picture>
      {photo.srcSet && <source type="image/webp" srcSet={photo.srcSet} sizes={sizes} />}
      <img
        ref={imgRef}
        className={className}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={loading}
        decoding={priority ? 'sync' : 'async'}
        {...priorityHint}
        style={style}
        {...rest}
      />
    </picture>
  );
}

export default Picture;
