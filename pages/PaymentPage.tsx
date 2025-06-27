
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { addClientAgent, updateClientAgent } from '../services/clientAgentService';
import { ClientAgentFormData } from '../types';

const PaymentPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateCurrentUser } = useAuth();

  const state = location.state as { pendingAgentData?: ClientAgentFormData, agentIdToUpdate?: string } | undefined;
  const pendingAgentData = state?.pendingAgentData;
  const agentIdToUpdate = state?.agentIdToUpdate;


  useEffect(() => {
    if (!pendingAgentData || !user) {
      setPaymentStatus('failed');
      return;
    }

    // Simulate payment processing
    const timer = setTimeout(async () => {
      try {
        // --- This is where the backend webhook logic is simulated ---
        // 1. Update user status to 'active'
        updateCurrentUser({ status: 'active' });

        // 2. Create or update the agent that triggered the flow
        if (agentIdToUpdate) {
          await updateClientAgent(agentIdToUpdate, pendingAgentData);
        } else {
          await addClientAgent(pendingAgentData, user);
        }

        // 3. Set status to success to show the confirmation UI
        setPaymentStatus('success');

      } catch(error) {
        console.error("Error during post-payment simulation:", error);
        setPaymentStatus('failed');
      }
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [pendingAgentData, user, updateCurrentUser, agentIdToUpdate]);

  const handleProceedToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl">
        <Link to="/" className="flex justify-center mb-6">
            <h1 className="text-5xl font-bold text-brazil-blue">GAPPCHAT</h1>
        </Link>

        {paymentStatus === 'processing' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processando Assinatura...</h2>
            <p className="text-gray-600 mb-8">
              Estamos ativando sua assinatura do Plano GAPPCHAT Pro (R$ 50,00/mês).
              Por favor, aguarde. Isso é uma simulação.
            </p>
            <LoadingSpinner size="w-12 h-12" />
            <p className="mt-4 text-sm text-gray-500">Redirecionando para um checkout seguro (simulado)...</p>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brazil-green mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-brazil-green mb-3">Assinatura Ativada!</h2>
            {user?.name && <p className="text-xl text-gray-700 mb-2">Parabéns, {user.name}!</p>}
            <p className="text-gray-600 mb-8">
              Sua conta está ativa e seu agente foi salvo com sucesso.
              Agora você pode acessar o painel de gestão para ver seu agente em ação.
            </p>
            <button
              onClick={handleProceedToDashboard}
              className="w-full bg-brazil-blue text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition duration-200 text-lg"
            >
              Ir para Meus Agentes
            </button>
          </>
        )}

        {paymentStatus === 'failed' && (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-500 mb-3">Falha na Ativação</h2>
            <p className="text-gray-600 mb-6">
              Houve um problema ao ativar sua conta ou salvar seu agente. Por favor, tente novamente a partir do seu painel.
            </p>
            <Link
              to="/admin/dashboard"
              className="w-full block bg-brazil-yellow text-brazil-blue font-semibold py-3 px-6 rounded-lg shadow hover:bg-yellow-300 transition duration-200 text-lg"
            >
              Voltar ao Painel
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;