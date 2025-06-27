
import React, { useState, useEffect, useCallback } from 'react';
import { ClientAgent } from '../../types';
import { getClientAgents, updateClientAgent } from '../../services/clientAgentService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface ClientWithAgents {
  ownerEmail: string;
  agents: ClientAgent[];
  isUpdating: boolean;
}

const WebhookSimulatorPage: React.FC = () => {
  const [clients, setClients] = useState<ClientWithAgents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // Admin user fetches all agents
      const allAgents = await getClientAgents(user);
      const clientsMap = new Map<string, ClientAgent[]>();

      allAgents.forEach(agent => {
        const ownerEmail = agent.ownerEmail || 'unknown';
        if (ownerEmail === 'gestor') return; // Don't show admin's own agents here

        if (!clientsMap.has(ownerEmail)) {
          clientsMap.set(ownerEmail, []);
        }
        clientsMap.get(ownerEmail)!.push(agent);
      });

      const groupedClients: ClientWithAgents[] = Array.from(clientsMap.entries()).map(([ownerEmail, agents]) => ({
        ownerEmail,
        agents,
        isUpdating: false,
      }));
      setClients(groupedClients);
    } catch (err) {
      setError("Falha ao carregar dados dos clientes.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleStatusUpdateForClient = async (ownerEmail: string, newStatus: 'active' | 'inactive') => {
    setError(null);
    const originalClients = JSON.parse(JSON.stringify(clients)); // Deep copy for rollback

    // Optimistic UI update + set loading state for the specific client
    setClients(currentClients => currentClients.map(c => {
      if (c.ownerEmail === ownerEmail) {
        return {
          ...c,
          isUpdating: true,
          agents: c.agents.map(a => ({ ...a, status: newStatus })),
        };
      }
      return c;
    }));

    try {
      const clientToUpdate = originalClients.find((c: ClientWithAgents) => c.ownerEmail === ownerEmail);
      if (clientToUpdate) {
        await Promise.all(
          clientToUpdate.agents.map((agent: ClientAgent) => 
            updateClientAgent(agent.id, { status: newStatus })
          )
        );
      }
    } catch (err) {
      setError(`Falha ao atualizar o status para o cliente ${ownerEmail}.`);
      console.error("Failed to update agent statuses", err);
      setClients(originalClients); // Revert on error
    } finally {
        // Unset loading state
        setClients(currentClients => currentClients.map(c => 
            c.ownerEmail === ownerEmail ? { ...c, isUpdating: false } : c
        ));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="w-16 h-16" />
      </div>
    );
  }
  
  // This page is only for the main administrator
  if (user?.email !== 'gestor') {
    return (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-600">Acesso Negado</h3>
            <p className="text-gray-600 mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Simulador de Webhook do Stripe</h2>
        <p className="text-gray-600 mt-2">
          Esta página simula o recebimento de eventos do Stripe para ativar ou desativar todos os GApps de um cliente.
        </p>
      </div>
      
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

      <div className="space-y-6">
        {clients.length > 0 ? clients.map(client => (
          <div key={client.ownerEmail} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                    <h3 className="text-xl font-semibold text-brazil-blue">{client.ownerEmail}</h3>
                    <p className="text-sm text-gray-500">
                        {client.agents.length} GApp(s) associado(s).
                    </p>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                    <button
                        onClick={() => handleStatusUpdateForClient(client.ownerEmail, 'inactive')}
                        disabled={client.isUpdating}
                        className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 flex items-center"
                    >
                         {client.isUpdating && <LoadingSpinner size="w-4 h-4 mr-2" />}
                        Simular Falha Pagto (Desativar)
                    </button>
                    <button
                        onClick={() => handleStatusUpdateForClient(client.ownerEmail, 'active')}
                        disabled={client.isUpdating}
                        className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 flex items-center"
                    >
                        {client.isUpdating && <LoadingSpinner size="w-4 h-4 mr-2" />}
                        Simular Pagto OK (Ativar)
                    </button>
                </div>
            </div>
          </div>
        )) : (
            <p className="text-gray-600 text-center">Nenhum cliente encontrado para simulação.</p>
        )}
      </div>
    </div>
  );
};

export default WebhookSimulatorPage;
