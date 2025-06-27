
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../components/admin/ClientForm';
import { addClientAgent } from '../../services/clientAgentService';
import { ClientAgentFormData } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import ActivationModal from '../../components/common/ActivationModal';

const AdminClientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for activation flow
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [pendingAgentData, setPendingAgentData] = useState<ClientAgentFormData | null>(null);

  const handleSubmit = async (data: ClientAgentFormData) => {
    setError(null);

    if (!user) {
      setError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    // Payment Gate: Check user status
    if (user.status === 'pending_payment') {
      setPendingAgentData(data);
      setShowActivationModal(true);
      return;
    }
    
    // User is active, proceed to save
    setIsSaving(true);
    try {
      await addClientAgent(data, user);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Error creating client agent:", err);
      setError('Falha ao criar o agente. Verifique se o Identificador de URL já existe ou tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartSubscription = () => {
    if (pendingAgentData) {
      // Navigate to payment page with the data needed to create the agent after payment
      navigate('/payment', { state: { pendingAgentData } });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo GApp</h2>
      {error && <p className="mb-4 text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      <ClientForm onSubmit={handleSubmit} isSaving={isSaving} />

      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        onConfirm={handleStartSubscription}
        isActivating={isSaving}
      />
    </div>
  );
};

export default AdminClientCreatePage;
