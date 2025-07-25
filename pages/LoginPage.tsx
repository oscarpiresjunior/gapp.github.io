
import React, { useState }  from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useBranding } from '../hooks/useBranding';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { logoUrl, isLoading: isBrandingLoading } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect away from login
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } else {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <Link to="/" className="flex justify-center mb-6 h-12 items-center">
             {isBrandingLoading ? (
                <div className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
             ) : logoUrl ? (
                <img src={logoUrl} alt="GAPPCHAT Logo" className="h-12 w-auto" />
             ) : (
                <h1 className="text-4xl font-bold text-brazil-blue">GAPPCHAT</h1>
             )}
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acessar Painel GAPPCHAT
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre com seu email e senha.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center p-2 bg-red-100 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="text" // Use text to allow "gestor" login, but guide users to use email
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue focus:z-10 sm:text-sm"
                placeholder="Email ou usuário 'gestor'"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isAuthLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brazil-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isAuthLoading ? <LoadingSpinner size="w-5 h-5" /> : 'Entrar'}
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link to="/signup" className="font-medium text-brazil-blue hover:text-blue-700">
            Assine o GAPPCHAT Pro
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
