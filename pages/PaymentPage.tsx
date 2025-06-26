
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PaymentPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const navigate = useNavigate();
  const location = useLocation();
  const signupState = location.state as { email?: string, name?: string } | undefined;

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      // Simulate a successful payment
      setPaymentStatus('success');
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, []);

  const handleProceedToDashboard = () => {
    // In a real app, the user might be automatically logged in or session established.
    // Here, we redirect to login, and they'd use the standard admin credentials for the demo.
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl">
        <Link to="/" className="flex justify-center mb-6">
            <h1 className="text-5xl font-bold text-brazil-blue">GApp</h1>
        </Link>

        {paymentStatus === 'processing' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processando Pagamento...</h2>
            <p className="text-gray-600 mb-8">
              Estamos processando sua assinatura do Plano GApp Pro (R$ 50,00/mês).
              Por favor, aguarde. Isso é uma simulação.
            </p>
            <LoadingSpinner size="w-12 h-12" />
            <p className="mt-4 text-sm text-gray-500">Simulando integração com Stripe...</p>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brazil-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-brazil-green mb-3">Pagamento Aprovado!</h2>
            {signupState?.name && <p className="text-xl text-gray-700 mb-2">Bem-vindo(a) ao GApp, {signupState.name}!</p>}
            <p className="text-gray-600 mb-6">
              Sua assinatura do Plano GApp Pro foi ativada com sucesso.
              Um email de boas-vindas e confirmação (simulado) foi enviado para {signupState?.email || 'seu email'}.
            </p>
            <p className="text-gray-600 mb-8">
              Agora você pode acessar o painel de gestão para criar e configurar seus agentes de IA.
            </p>
            <button
              onClick={handleProceedToDashboard}
              className="w-full bg-brazil-blue text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition duration-200 text-lg"
            >
              Acessar Painel de Gestão
            </button>
          </>
        )}

        {paymentStatus === 'failed' && ( // Placeholder for potential future simulation
           <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-500 mb-3">Falha no Pagamento</h2>
            <p className="text-gray-600 mb-6">
              Houve um problema ao processar seu pagamento. Por favor, tente novamente ou contate o suporte.
            </p>
            <Link
              to="/signup"
              className="w-full block bg-brazil-yellow text-brazil-blue font-semibold py-3 px-6 rounded-lg shadow hover:bg-yellow-300 transition duration-200 text-lg"
            >
              Tentar Novamente
            </Link>
          </>
        )}
         <p className="mt-8 text-sm text-gray-500">
            Retornar para <Link to="/" className="text-brazil-blue hover:underline">Página Inicial</Link>.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
