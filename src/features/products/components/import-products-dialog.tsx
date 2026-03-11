import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useWorkCenterStore } from '@/stores/work-center-store';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportProductsDialog({ open, onOpenChange }: ImportProductsDialogProps) {
  const { selectedWorkCenterId } = useWorkCenterStore();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    added: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/productos/import/template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla_productos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar la plantilla.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedWorkCenterId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post(`/productos/import/${selectedWorkCenterId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResults(response.data.results);
      queryClient.invalidateQueries({ queryKey: ['products', selectedWorkCenterId] });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar productos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
        setSelectedFile(null);
        setImportResults(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Productos</DialogTitle>
          <DialogDescription>
            Importa múltiples productos mediante un archivo Excel (.xlsx).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Step 1: Template */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">1. Descarga la plantilla</h3>
            <p className="text-sm text-zinc-500">Usa este archivo como base para rellenar tus productos (Considera el precio sin IVA).</p>
            <Button variant="outline" className="w-fit mt-2" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Descargar Plantilla Excel
            </Button>
          </div>

          {/* Step 2: Upload */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">2. Sube tu archivo</h3>
            <p className="text-sm text-zinc-500">Selecciona el archivo Excel previamente rellenado.</p>
            
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div 
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${selectedFile ? 'border-primary bg-primary/5' : 'border-zinc-300 hover:border-primary/50 dark:border-zinc-700'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-500">Clic para cambiar archivo</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                  <p className="text-sm font-medium">Haz clic aquí para seleccionar tu archivo Excel</p>
                </>
              )}
            </div>
          </div>

          {/* Results */}
          {importResults && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Resultado de la importación
              </h3>
              <p className="text-sm font-medium text-green-600 dark:text-green-500">
                ✅ Agregados exitosamente: {importResults.added}
              </p>
              
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-900">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {importResults.errors.length} errores detectados:
                  </p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto list-disc pl-4">
                    {importResults.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose}>
            {importResults ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!importResults && (
            <Button 
                onClick={handleImport} 
                disabled={!selectedFile || isUploading}
                className="bg-primary text-white"
            >
                {isUploading ? 'Importando...' : 'Comenzar Importación'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
