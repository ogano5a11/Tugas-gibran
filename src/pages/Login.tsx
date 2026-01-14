import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { slideInLeft, slideInRight } from '../utils/animations';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  
  const leftRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    slideInLeft(leftRef.current);
    slideInRight(formRef.current);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const timeout = setTimeout(() => {
        if (loading) {
            setLoading(false);
            setErrorMsg("Koneksi lambat. Silakan coba lagi.");
        }
    }, 10000);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        clearTimeout(timeout); 
        navigate('/');
      }
      
    } catch (error: any) {
      clearTimeout(timeout);
      console.error("Login Error:", error.message);
      
      let pesan = error.message;
      if (pesan.includes("Invalid login credentials")) pesan = "Email atau password salah.";
      if (pesan.includes("Email not confirmed")) pesan = "Email belum diverifikasi. Cek inbox Anda.";
      
      setErrorMsg(pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div ref={leftRef} className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Semua Kebutuhan Rumah,{' '}
            <span className="text-green-600">Pasti Beres</span>
          </h1>
          <p className="text-lg text-gray-600">
            Temukan mitra terverifikasi untuk perbaikan, kebersihan, hingga
            renovasi. Aman, transparan, dan bergaransi.
          </p>
        </div>

        <div ref={formRef} className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Log In</h2>
          <p className="text-gray-600 mb-6">Masuk untuk melanjutkan</p>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={18} />
                {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
              ) : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}