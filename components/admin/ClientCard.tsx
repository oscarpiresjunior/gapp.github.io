
import React from 'react';
import { Link } from 'react-router-dom';
import { ClientAgent } from '../../types';

interface ClientCardProps {
  agent: ClientAgent;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: 'active' | 'inactive') => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ agent, onDelete, onStatusChange }) => {
  const chatUrl = `/#/chat/${agent.url_identifier}`;
  const displayUrl = `gapp-${agent.url_identifier}.netlify.app (via /#/chat/${agent.url_identifier})`;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-brazil-blue mb-2">{agent.name}</h3>
        {agent.ownerEmail && agent.ownerEmail !== 'gestor' && (
           <p className="text-xs text-gray-500 mb-2 truncate" title={agent.ownerEmail}>
              Proprietário: {agent.ownerEmail}
           </p>
        )}
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">URL do Chat:</span>{' '}
          <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="text-brazil-green hover:underline">
            {displayUrl}
          </a>
        </p>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Status:</span>{' '}
            <span className={`font-semibold ${agent.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                {agent.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </p>
          <button
            role="switch"
            aria-checked={agent.status === 'active'}
            onClick={() => onStatusChange(agent.id, agent.status === 'active' ? 'inactive' : 'active')}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brazil-blue ${
              agent.status === 'active' ? 'bg-brazil-green' : 'bg-gray-300'
            }`}
            aria-label={`Mudar status para ${agent.status === 'active' ? 'inativo' : 'ativo'}`}
          >
            <span
              aria-hidden="true"
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                agent.status === 'active' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="mt-4 flex space-x-3">
        <Link
          to={`/admin/clients/edit/${agent.id}`}
          className="text-sm bg-brazil-yellow text-brazil-blue font-semibold py-2 px-4 rounded hover:bg-yellow-300 transition-colors duration-200"
        >
          Editar
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="text-sm bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200"
        >
          Excluir
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
