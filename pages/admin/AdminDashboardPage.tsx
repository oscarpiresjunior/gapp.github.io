
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClientAgent } from '../../types';
import { getClientAgents, deleteClientAgent, updateClientAgent } from '../../services/clientAgentService';
import ClientCard from '../../components/admin/ClientCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<ClientAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAgents = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAgents = await getClientAgents(user);
      setAgents(fetchedAgents);
    } catch (err) {
      setError('Falha ao carregar os agentes. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeleteAgent = async (id: string) => {
    // Permission is checked by user's view (admin sees all, user sees their own)
    const agentToDelete = agents.find(agent => agent.id === id);
    if (!agentToDelete) return;

    if (window.confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
      setIsLoading(true);
      try {
        await deleteClientAgent(id);
        setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id));
      } catch (err) {
        setError('Falha ao excluir o agente.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStatusToggle = async (id: string, newStatus: 'active' | 'inactive') => {
    const originalAgents = [...agents];
    // Optimistic UI update for responsiveness
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === id ? { ...agent, status: newStatus } : agent
      )
    );

    try {
      await updateClientAgent(id, { status: newStatus });
    } catch (err) {
      setError('Falha ao atualizar o status do agente.');
      console.error(err);
      // Revert UI on failure
      setAgents(originalAgents);
    }
  };

  if (isLoading && agents.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="w-16 h-16" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Meus Agentes</h2>
        <Link
          to="/admin/clients/new"
          className="bg-brazil-green text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-green-700 transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Novo Agente
        </Link>
      </div>

      {agents.length === 0 && !isLoading ? (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">Bem-vindo(a), {user?.name}!</h3>
            <p className="text-gray-600 mt-2">Você ainda não tem nenhum agente.</p>
            <p className="text-gray-600 mt-1">Crie seu primeiro agente para começar a interagir!</p>
             <Link
              to="/admin/clients/new"
              className="mt-6 inline-block bg-brazil-green text-white font-semibold py-2 px-5 rounded-lg shadow hover:bg-green-700 transition duration-200"
            >
              Criar meu primeiro Agente
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <ClientCard 
              key={agent.id} 
              agent={agent} 
              onDelete={handleDeleteAgent}
              onStatusChange={handleStatusToggle} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;