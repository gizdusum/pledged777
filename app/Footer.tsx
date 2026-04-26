export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerBuilt">BUILT BY</div>
      <div className="footerSocials">
        <a href="https://x.com/pledged777" target="_blank" rel="noreferrer" className="footerSocialLink">
          <svg viewBox="0 0 24 24" className="footerSvg" aria-hidden="true">
            <path d="M18.2 2.25h3.3l-7.2 8.23 8.47 11.27h-6.63l-5.2-6.84-5.95 6.84H1.68l7.72-8.86L1.27 2.25H8.1l4.7 6.26 5.4-6.26Zm-1.15 17.52h1.83L7.1 4.13H5.14l11.91 15.64Z" />
          </svg>
          <span>pledged777</span>
        </a>
        <span className="footerDivider">·</span>
        <a href="https://github.com/gizdusum/pledged777" target="_blank" rel="noreferrer" className="footerSocialLink">
          <svg viewBox="0 0 24 24" className="footerSvg" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.32 9.32 0 0 1 12 6.97c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.2 10.2 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
          </svg>
          <span>gizdusum/pledged777</span>
        </a>
      </div>
      <div className="footerChain">Built on Ritual Testnet</div>
    </footer>
  );
}
