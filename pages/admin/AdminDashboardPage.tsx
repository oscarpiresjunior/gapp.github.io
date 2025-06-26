
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClientAgent } from '../../types';
import { getClientAgents, deleteClientAgent } from '../../services/clientAgentService';
import ClientCard from '../../components/admin/ClientCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage: React.FC = () => {
  const [agents, setAgents] = useState<ClientAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedAgents = await getClientAgents();
      setAgents(fetchedAgents);
    } catch (err) {
      setError('Falha ao carregar os agentes. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeleteAgent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.')) {
      setIsLoading(true); // Consider a more granular loading state for deletion
      try {
        await deleteClientAgent(id);
        setAgents(prevAgents => prevAgents.filter(agent => agent.id !== id));
      } catch (err) {
        setError('Falha ao excluir o agente.');
        console.error(err);
      } finally {
        setIsLoading(false); // Reset global loading or use specific delete loading
      }
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
        <h2 className="text-3xl font-bold text-gray-800">Meus GApps</h2>
        <Link
          to="/admin/clients/new"
          className="bg-brazil-green text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-green-700 transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Adicionar Novo GApp
        </Link>
      </div>

      {agents.length === 0 && !isLoading ? (
        <p className="text-gray-600 text-center py-10">Nenhum agente GApp encontrado. Adicione um novo para começar!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map(agent => (
            <ClientCard key={agent.id} agent={agent} onDelete={handleDeleteAgent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
