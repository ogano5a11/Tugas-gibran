import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import ServiceDetail from './pages/ServiceDetail';
import Booking from './pages/Booking';
import ComingSoon from './pages/ComingSoon';
import About from './pages/About';
import Bantuan from './pages/Bantuan';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/kategori" element={<Categories />} />
                    <Route path="/layanan/:id" element={<ServiceDetail />} />
                    <Route path="/pesan/:id" element={<Booking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/bantuan" element={<Bantuan />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;