
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientForm from '../../components/admin/ClientForm';
import { getClientAgentById, updateClientAgent } from '../../services/clientAgentService';
import { ClientAgent, ClientAgentFormData } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import ActivationModal from '../../components/common/ActivationModal';

const AdminClientEditPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [agent, setAgent] = useState<ClientAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for activation flow
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [pendingAgentData, setPendingAgentData] = useState<ClientAgentFormData | null>(null);

  const fetchAgentData = useCallback(async () => {
    if (!agentId) {
      setError("ID do agente não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAgent = await getClientAgentById(agentId);
      if (fetchedAgent) {
        // Security check: ensure the user owns this agent
        if (fetchedAgent.ownerEmail !== user?.email) {
          setError('Você não tem permissão para editar este agente.');
          setAgent(null);
        } else {
          setAgent(fetchedAgent);
        }
      } else {
        setError('Agente não encontrado.');
      }
    } catch (err) {
      console.error("Error fetching client agent:", err);
      setError('Falha ao carregar dados do agente.');
    } finally {
      setIsLoading(false);
    }
  }, [agentId, user?.email]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  const handleSubmit = async (data: ClientAgentFormData) => {
    if (!agentId || !user) return;
    setError(null);
    
    // Payment Gate: Check user status
    if (user.status === 'pending_payment') {
      setPendingAgentData(data);
      setShowActivationModal(true);
      return;
    }

    // User is active, proceed to update
    setIsSaving(true);
    try {
      await updateClientAgent(agentId, data);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Error updating client agent:", err);
      setError('Falha ao atualizar o agente. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartSubscription = () => {
    if (pendingAgentData) {
      // Navigate to payment page with data to update agent after payment
      navigate('/payment', { state: { pendingAgentData, agentIdToUpdate: agentId } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error && !agent) {
    return <p className="text-red-500 text-center p-4 bg-red-100 rounded-md">{error}</p>;
  }
  
  if (!agent) {
     return <p className="text-gray-600 text-center">Agente não encontrado ou acesso não permitido.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Agente: {agent.name}</h2>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <ClientForm initialData={agent} onSubmit={handleSubmit} isSaving={isSaving} />

      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onConfirm={handleStartSubscription}
        isActivating={isSaving}
      />
    </div>
  );
};

export default AdminClientEditPage;