
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientForm from '../../components/admin/ClientForm';
import { getClientAgentById, updateClientAgent } from '../../services/clientAgentService';
import { ClientAgent, ClientAgentFormData } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminClientEditPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<ClientAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setAgent(fetchedAgent);
      } else {
        setError('Agente não encontrado.');
      }
    } catch (err) {
      console.error("Error fetching client agent:", err);
      setError('Falha ao carregar dados do agente.');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  const handleSubmit = async (data: ClientAgentFormData) => {
    if (!agentId) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateClientAgent(agentId, data);
      navigate('/admin/dashboard'); // Redirect after successful update
    } catch (err) {
      console.error("Error updating client agent:", err);
      setError('Falha ao atualizar o agente. Tente novamente.');
    } finally {
      setIsSaving(false);
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
     return <p className="text-gray-600 text-center">Agente não encontrado.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar GApp: {agent.name}</h2>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <ClientForm initialData={agent} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
};

export default AdminClientEditPage;
