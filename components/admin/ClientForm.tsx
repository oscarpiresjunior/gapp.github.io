import React, { useState, useEffect, useCallback } from 'react';
import { ClientAgent, ClientAgentFormData, ClientAgentAttachment } from '../../types';

interface ClientFormProps {
  onSubmit: (data: ClientAgentFormData) => Promise<void>;
  initialData?: ClientAgent | null;
  isSaving: boolean;
}

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const ALLOWED_FILE_EXTENSIONS_STRING = '.jpg, .jpeg, .png, .webp, .mp4';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Get only base64 part
    reader.onerror = error => reject(error);
  });
};

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, initialData, isSaving }) => {
  const [formData, setFormData] = useState<ClientAgentFormData>({
    name: '',
    url_identifier: '',
    master_prompt: '',
    status: 'active',
    geminiApiKey: '',
    attachments: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ClientAgentFormData | 'attachments', string>>>({});
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // To reset file input

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url_identifier: initialData.url_identifier,
        master_prompt: initialData.master_prompt,
        status: initialData.status,
        geminiApiKey: initialData.geminiApiKey || '',
        attachments: initialData.attachments || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ClientAgentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (name === 'name' && value) {
        const identifier = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({...prev, url_identifier: identifier}));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setErrors(prev => ({ ...prev, attachments: undefined })); // Clear previous file error

    let newAttachments: ClientAgentAttachment[] = [...(formData.attachments || [])];
    let fileErrorOccurred = false;

    for (const file of Array.from(files)) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setErrors(prev => ({ ...prev, attachments: `Arquivo '${file.name}' tem tipo inválido. Permitidos: ${ALLOWED_FILE_EXTENSIONS_STRING}` }));
        fileErrorOccurred = true;
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrors(prev => ({ ...prev, attachments: `Arquivo '${file.name}' é muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB.` }));
        fileErrorOccurred = true;
        continue;
      }
      try {
        const base64Data = await fileToBase64(file);
        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}-${file.name}`, // more unique ID
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size,
        });
      } catch (error) {
        console.error("Error converting file to base64:", error);
        setErrors(prev => ({ ...prev, attachments: `Erro ao processar arquivo '${file.name}'.` }));
        fileErrorOccurred = true;
      }
    }
    
    if (!fileErrorOccurred) { // Only update if all selected files were processed successfully without individual errors.
        setFormData(prev => ({ ...prev, attachments: newAttachments }));
    }
    setFileInputKey(Date.now()); // Reset file input to allow re-selection of the same file if needed
  };

  const removeAttachment = (attachmentId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== attachmentId) || [],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientAgentFormData | 'attachments', string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome do Cliente é obrigatório.';
    if (!formData.url_identifier.trim()) {
        newErrors.url_identifier = 'Identificador para URL é obrigatório.';
    } else if (!/^[a-z0-9-]+$/.test(formData.url_identifier)) {
        newErrors.url_identifier = 'Identificador deve conter apenas letras minúsculas, números e hífens.';
    }
    if (!formData.master_prompt.trim()) newErrors.master_prompt = 'Prompt Mestre do Agente é obrigatório.';
    // API key is optional, no validation needed unless it's present and needs specific format.
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !errors.attachments; // Check general errors and attachment error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
      {/* General Info Section */}
      <fieldset className="space-y-6">
        <legend className="text-xl font-semibold text-gray-700 mb-4">Informações do Agente</legend>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Cliente
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue sm:text-sm`}
            placeholder="Ex: Startup Social"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="url_identifier" className="block text-sm font-medium text-gray-700 mb-1">
            Identificador para URL
          </label>
          <input
            type="text"
            name="url_identifier"
            id="url_identifier"
            value={formData.url_identifier}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.url_identifier ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue sm:text-sm bg-gray-50`}
            placeholder="Ex: startupsocial (auto-gerado ou customizado)"
            readOnly // Typically auto-generated or carefully managed
          />
          {errors.url_identifier && <p className="mt-1 text-xs text-red-500">{errors.url_identifier}</p>}
          <p className="mt-1 text-xs text-gray-500">Usado para formar a URL. Gerado automaticamente a partir do nome.</p>
        </div>

        <div>
          <label htmlFor="master_prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Mestre do Agente (System Instruction)
          </label>
          <textarea
            name="master_prompt"
            id="master_prompt"
            rows={12}
            value={formData.master_prompt}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.master_prompt ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue sm:text-sm`}
            placeholder="Cole aqui o prompt completo do agente... Lembre-se de instruir o AI sobre os arquivos anexados e como usar [SHOW_FILE:nome_do_arquivo.ext] para exibi-los."
          />
          {errors.master_prompt && <p className="mt-1 text-xs text-red-500">{errors.master_prompt}</p>}
           <p className="mt-1 text-xs text-gray-500">Informe ao AI sobre os arquivos anexados e como ele pode solicitar a exibição deles (ex: `[SHOW_FILE:nomedoarquivo.jpg]`).</p>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue sm:text-sm rounded-md"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </fieldset>

      {/* API Key Section */}
      <fieldset className="space-y-6 pt-6 border-t border-gray-200">
        <legend className="text-xl font-semibold text-gray-700 mb-4">Configuração da API Gemini</legend>
        <div>
          <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 mb-1">
            Gemini API Key (Opcional)
          </label>
          <input
            type="password" 
            name="geminiApiKey"
            id="geminiApiKey"
            value={formData.geminiApiKey}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brazil-blue focus:border-brazil-blue sm:text-sm"
            placeholder="Cole a API Key do Gemini específica para este Agente"
          />
          <p className="mt-1 text-xs text-gray-500">Se deixado em branco, a API Key padrão da plataforma será utilizada.</p>
        </div>
      </fieldset>

      {/* Attachments Section */}
      <fieldset className="space-y-6 pt-6 border-t border-gray-200">
        <legend className="text-xl font-semibold text-gray-700 mb-4">Arquivos de Referência do Agente</legend>
        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
            Adicionar Arquivos (Imagens: JPG, PNG, WEBP; Vídeos: MP4 - Máx {MAX_FILE_SIZE_MB}MB por arquivo)
          </label>
          <input
            key={fileInputKey} // Used to reset the input
            type="file"
            name="attachments"
            id="attachments"
            multiple
            onChange={handleFileChange}
            accept={ALLOWED_FILE_EXTENSIONS_STRING}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brazil-yellow file:text-brazil-blue hover:file:bg-yellow-300"
          />
          {errors.attachments && <p className="mt-1 text-xs text-red-500">{errors.attachments}</p>}
        </div>

        {formData.attachments && formData.attachments.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Arquivos Anexados:</h4>
            <ul className="space-y-3">
              {formData.attachments.map(att => (
                <li key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {att.type === 'image' && (
                      <img 
                        src={`data:${att.mimeType};base64,${att.data}`} 
                        alt={att.name} 
                        className="w-16 h-16 object-cover rounded-md border" 
                      />
                    )}
                    {att.type === 'video' && (
                       <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center text-white">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                         </svg>
                       </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate max-w-xs" title={att.name}>{att.name}</p>
                      <p className="text-xs text-gray-500">{att.mimeType} - {(att.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm p-1"
                    aria-label={`Remover ${att.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </fieldset>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
         <button
            type="button"
            onClick={() => window.history.back()}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brazil-blue"
            disabled={isSaving}
          >
            Cancelar
          </button>
        <button
          type="submit"
          disabled={isSaving || !!errors.attachments} // Disable if there's an attachment processing error
          className="bg-brazil-green hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Agente')}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;