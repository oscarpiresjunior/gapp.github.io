
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../components/admin/ClientForm';
import { addClientAgent } from '../../services/clientAgentService';
import { ClientAgentFormData } from '../../types';

const AdminClientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ClientAgentFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      // Here, you could also check if url_identifier is unique before saving
      // This would typically involve another service call if not handled by DB constraint
      await addClientAgent(data);
      navigate('/admin/dashboard'); // Redirect to dashboard after successful creation
    } catch (err) {
      console.error("Error creating client agent:", err);
      setError('Falha ao criar o agente. Verifique se o Identificador de URL já existe ou tente novamente.');
      // A more specific error could be set based on the actual error from the service
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo GApp</h2>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <ClientForm onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
};

export default AdminClientCreatePage;
