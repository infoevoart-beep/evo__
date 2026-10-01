import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

/*
 * Hand the webfont stylesheet to the renderer. index.html parks it on
 * `media="print"` so a slow or unreachable fonts.googleapis.com cannot hold
 * up the first paint; by the time this runs the preload has it in cache, so
 * flipping the media attribute applies it immediately. Guarded because the
 * link is absent in test environments.
 */
for (const link of document.querySelectorAll('link[data-webfont]')) {
  link.media = 'all';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
