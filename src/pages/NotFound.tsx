import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-lexend text-7xl font-bold text-gray-200 mb-2">404</p>
      <h1 className="font-lexend text-xl font-semibold text-gray-800 mb-2">Page introuvable</h1>
      <p className="font-poppins text-sm text-gray-500 mb-6">Cette page n'existe pas ou a été déplacée.</p>
      <Button onClick={() => navigate('/')} icon={<Home className="h-4 w-4" />}>
        Retour à l'accueil
      </Button>
    </div>
  );
}
