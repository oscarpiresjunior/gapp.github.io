
import React from 'react';
import { Link } from 'react-router-dom';
import { ClientAgent } from '../../types';

interface ClientCardProps {
  agent: ClientAgent;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ agent, onDelete }) => {
  const chatUrl = `/#/chat/${agent.url_identifier}`;
  // For actual Netlify URL, it would be `https://gapp-${agent.url_identifier}.netlify.app`
  // but for SPA demo, hash route is used.
  const displayUrl = `gapp-${agent.url_identifier}.netlify.app (via /#/chat/${agent.url_identifier})`;


  return (
    <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-brazil-blue mb-2">{agent.name}</h3>
      <p className="text-sm text-gray-600 mb-1">
        <span className="font-medium">URL do Chat:</span>{' '}
        <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="text-brazil-green hover:underline">
          {displayUrl}
        </a>
      </p>
      <p className="text-sm text-gray-600 mb-3">
        <span className="font-medium">Status:</span>{' '}
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {agent.status === 'active' ? 'Ativo' : 'Inativo'}
        </span>
      </p>
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
