import { useState, FC, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sailboat, User, Lock } from 'lucide-react';

const LoginPage: FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-900 via-sail-blue to-orange-200">
      {/* Abstract SVG Background */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="none">
        <path d="M0,300 C150,200 350,400 600,250 C850,100 1000,400 800,600 L0,600 Z" fill="url(#blobGradient)" />
        <defs>
          <linearGradient id="blobGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-8 border border-white/30">
        <div className="text-center space-y-2 animate-fadeIn">
          <div className="flex justify-center items-center gap-3">
            <Sailboat size={48} className="text-orange-500 drop-shadow-md" />
            <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight">RakeNet</h1>
          </div>
          <p className="text-gray-600 font-medium">Rake Formation Decision Support</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 shadow-sm"
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 shadow-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center animate-fadeIn">{error}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 transition-all duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          Hint: Use 'admin'/'password' or 'manager_bhilai'/'password'.
        </p>
      </div>

      <div className="text-center text-gray-300 mt-8 text-sm">
        © 2025 RakeNet – Decision Support System Prototype
      </div>
    </div>
  );
};

export default LoginPage;