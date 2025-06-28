
import React, { useState, useRef } from 'react';
import { useBranding } from '../../hooks/useBranding';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const ALLOWED_FILE_EXTENSIONS_STRING = '.png, .jpg, .jpeg, .svg';
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const BrandingPage: React.FC = () => {
  const { logoUrl, updateLogo, isLoading: isContextLoading } = useBranding();
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMessage(null);
    const file = event.target.files?.[0];

    if (!file) {
      setNewLogoPreview(null);
      setNewLogoFile(null);
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(`Tipo de arquivo inválido. Permitidos: ${ALLOWED_FILE_EXTENSIONS_STRING}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Arquivo muito grande. O tamanho máximo é de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setNewLogoPreview(dataUrl);
      setNewLogoFile(dataUrl);
    } catch (err) {
      console.error(err);
      setError('Falha ao ler o arquivo de imagem.');
    }
  };

  const handleSave = () => {
    if (!newLogoFile) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      updateLogo(newLogoFile);
      setSuccessMessage('Logo atualizado com sucesso!');
      setNewLogoPreview(null);
      setNewLogoFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError('Ocorreu um erro ao salvar o logo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Tem certeza que deseja remover o logo customizado e voltar para o padrão?')) {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        updateLogo(null);
        setSuccessMessage('Logo removido com sucesso.');
      } catch (err) {
        setError('Ocorreu um erro ao remover o logo.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const currentLogo = newLogoPreview || logoUrl;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Personalizar Marca</h2>
      <p className="text-gray-600 mb-8">Faça o upload do logo para customizar a aparência da plataforma.</p>
      
      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">{successMessage}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Side: Upload and Actions */}
          <div className="space-y-6">
            <div>
              <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo do Logo ({ALLOWED_FILE_EXTENSIONS_STRING})
              </label>
              <input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept={ALLOWED_FILE_EXTENSIONS_STRING}
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brazil-yellow file:text-brazil-blue hover:file:bg-yellow-300"
              />
               <p className="mt-1 text-xs text-gray-500">Tamanho máximo: {MAX_FILE_SIZE_MB}MB. Recomendado: fundo transparente.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
               <button
                  onClick={handleSave}
                  disabled={!newLogoFile || isSaving}
                  className="w-full sm:w-auto flex-grow bg-brazil-green hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {isSaving ? <LoadingSpinner size="w-5 h-5" /> : 'Salvar Novo Logo'}
                </button>
                <button
                  onClick={handleRemove}
                  disabled={!logoUrl || isSaving}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Remover Logo Atual
                </button>
            </div>
          </div>

          {/* Right Side: Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pré-visualização</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center bg-gray-50">
              {isContextLoading ? (
                <LoadingSpinner />
              ) : currentLogo ? (
                <img src={currentLogo} alt="Pré-visualização do Logo" className="max-h-full max-w-full" />
              ) : (
                <div className="text-center text-gray-500">
                  <h4 className="text-2xl font-bold text-brazil-blue">GAPPCHAT</h4>
                  <p className="text-sm mt-1">Nenhum logo customizado.</p>
                </div>
              )}
            </div>
            {newLogoPreview && <p className="text-xs text-center mt-2 text-blue-600">Pré-visualização do novo logo. Clique em 'Salvar' para aplicar.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;
