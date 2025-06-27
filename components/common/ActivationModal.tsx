
import React from 'react';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isActivating: boolean;
}

const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose, onConfirm, isActivating }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center transform transition-all scale-100 opacity-100">
        <h2 className="text-3xl font-bold text-brazil-blue mb-4">Ative seu Agente para Começar</h2>
        <p className="text-gray-700 text-lg mb-8">
          Seu agente está configurado e pronto para trabalhar. Ative sua assinatura do <span className="font-bold">GAPPCHAT Pro</span> (<span className="font-bold text-brazil-green">R$ 50/mês</span>) para colocá-lo online e começar a interagir com seus clientes.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            disabled={isActivating}
            className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brazil-blue disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            disabled={isActivating}
            className="bg-brazil-green hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isActivating ? 'Aguarde...' : 'Ativar Assinatura'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivationModal;
