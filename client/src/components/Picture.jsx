import { useCallback, useState } from 'react';

/**
 * A photograph, served at a sensible size.
 *
 * Emits an AVIF and a WebP `<source>` with the original JPEG as the `<img>`
 * fallback, and always sets intrinsic width/height so the browser reserves the
 * right box and the page does not jump as images arrive.
 *
 * The AVIF ladder is often absent — the build only keeps AVIF for photographs
 * where it beat WebP at matching quality across every width — in which case
 * the browser simply takes the WebP source.
 *
 * Until the real file decodes, the element shows its LQIP: a 20px blurred
 * version inlined as a data URI, scaled up behind the image. On a slow
 * connection that turns a dark rectangle into something that reads as the
 * photograph within the first paint.
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

  // A cached image can finish before React attaches onLoad, so the ref
  // callback settles that case rather than leaving the blur stuck on top.
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);
  const setNode = useCallback(
    (node) => {
      if (typeof imgRef === 'function') imgRef(node);
      else if (imgRef) imgRef.current = node;
      if (node?.complete && node.naturalWidth > 0) setLoaded(true);
    },
    [imgRef]
  );

  // React 18 passes through only the lowercase spelling of this attribute,
  // and warns on any unknown prop even when its value is undefined — so it
  // is added conditionally rather than set to undefined.
  const priorityHint = priority ? { fetchpriority: 'high' } : {};

  const placeholder =
    photo.lqip && !loaded
      ? {
          backgroundImage: `url("${photo.lqip}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

  return (
    // `picture` is display:contents, so styling and refs belong on the img.
    <picture>
      {photo.avifSrcSet && <source type="image/avif" srcSet={photo.avifSrcSet} sizes={sizes} />}
      {photo.srcSet && <source type="image/webp" srcSet={photo.srcSet} sizes={sizes} />}
      <img
        ref={setNode}
        className={className}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={loading}
        decoding={priority ? 'sync' : 'async'}
        onLoad={onLoad}
        {...priorityHint}
        style={{ ...placeholder, ...style }}
        {...rest}
      />
    </picture>
  );
}

export default Picture;
