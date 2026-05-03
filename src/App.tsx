import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Cta from './components/Cta';
import Play from './pages/Play';
import Guide from './pages/Guide';

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Cta />
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<Play />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
    </BrowserRouter>
  );
}
