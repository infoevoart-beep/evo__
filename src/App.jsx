import { Route, Routes } from 'react-router-dom';
import { BrandMarkSprite } from './components/BrandMark';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Smokehouse from './pages/Smokehouse';
import Cuisine from './pages/Cuisine';
import Gallery from './pages/Gallery';
import Visit from './pages/Visit';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <BrandMarkSprite />
      <ScrollToTop />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/smokehouse" element={<Smokehouse />} />
          <Route path="/cuisine" element={<Cuisine />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/visit" element={<Visit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
