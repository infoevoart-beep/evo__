import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrandMarkSprite } from './components/BrandMark';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { StructuredData } from './components/StructuredData';
import Home from './pages/Home';

/**
 * Home ships in the main bundle because it is the common entry point; the
 * rest are fetched on navigation, so a first visit does not pay for the
 * gallery, the reservation form and five pages of copy it may never open.
 */
const About = lazy(() => import('./pages/About'));
const Smokehouse = lazy(() => import('./pages/Smokehouse'));
const Cuisine = lazy(() => import('./pages/Cuisine'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Visit = lazy(() => import('./pages/Visit'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <BrandMarkSprite />
      <StructuredData />
      <ScrollToTop />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {/* Holds the viewport open while a route chunk loads, so the header
            does not jump against an empty page. */}
        <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/smokehouse" element={<Smokehouse />} />
            <Route path="/cuisine" element={<Cuisine />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/visit" element={<Visit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
