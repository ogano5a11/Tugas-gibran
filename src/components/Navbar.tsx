import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const context = useContext(AuthContext); 
  const user = context?.user;
  const signOut = context?.signOut;
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (signOut) {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Beres.in</h1>
          </Link>

          {/* === MENU DESKTOP === */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600 transition-colors">
              About Us
            </Link>
            <Link to="/kategori" className="text-gray-700 hover:text-green-600 transition-colors">
              Layanan Kami
            </Link>
            <Link to="/bantuan" className="text-gray-700 hover:text-green-600 transition-colors">
              Bantuan
            </Link>

            {/* Tombol Dashboard Mitra */}
            {user?.role === 'admin' && (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1 text-green-700 hover:text-green-800 font-medium transition-colors border border-green-600 px-3 py-1 rounded-full bg-green-50"
              >
                <LayoutDashboard size={16} />
                Dashboard Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <User size={18} className="text-green-600" />
                  <span>{user.name || user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1 text-sm bg-red-50 px-3 py-1.5 rounded-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Tombol Hamburger Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* === MENU MOBILE (DROPDOWN) === */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-green-600 py-3 border-b border-gray-50">
              Home
            </Link>
            <Link to="/about" className="block text-gray-700 hover:text-green-600 py-3 border-b border-gray-50">
              About Us
            </Link>
            <Link to="/kategori" className="block text-gray-700 hover:text-green-600 py-3 border-b border-gray-50">
              Layanan Kami
            </Link>
            <Link to="/bantuan" className="block text-gray-700 hover:text-green-600 py-3 border-b border-gray-50">
              Bantuan
            </Link>

            {/* Tombol Dashboard Mitra (Versi Mobile) */}
            {user?.role === 'admin' && (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-green-700 font-bold py-3 border-b border-gray-50 bg-green-50 px-2 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                Dashboard Admin
              </Link>
            )}

            {user ? (
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-900 font-bold px-2">
                  <User size={20} className="text-green-600" />
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-medium py-3 rounded-lg"
                >
                  <LogOut size={18} />
                  Keluar Akun
                </button>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-2 gap-3">
                <Link 
                  to="/register" 
                  className="block text-center text-green-600 font-medium py-2 border border-green-600 rounded-lg"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="block text-center bg-green-600 text-white font-medium py-2 rounded-lg shadow-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}