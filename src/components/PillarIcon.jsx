const paths = {
  wild: (
    <>
      <path d="M3 19l6-9 4 5 3-4 5 8Z" />
      <circle cx="7" cy="6" r="2" />
    </>
  ),
  rustic: (
    <>
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M9 21v-8h6v8" />
    </>
  ),
  premium: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  authentic: (
    <>
      <path d="M4 19c4-10 12-10 16 0" />
      <circle cx="12" cy="8" r="3.4" />
    </>
  ),
  experiential: (
    <>
      <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      <circle cx="12" cy="12" r="3.8" />
    </>
  ),
};

export function PillarIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default PillarIcon;
