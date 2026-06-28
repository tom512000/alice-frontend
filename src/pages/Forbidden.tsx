import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldOff } from 'lucide-react';

export function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <ShieldOff className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="font-lexend text-xl font-semibold text-gray-800 mb-2">Accès refusé</h1>
      <p className="font-poppins text-sm text-gray-500 mb-6">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Button variant="outline" onClick={() => navigate(-1)} icon={<ArrowLeft className="h-4 w-4" />}>
        Retour
      </Button>
    </div>
  );
}
