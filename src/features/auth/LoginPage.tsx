import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login, verifyTwoFactorLogin, clearError } from './authSlice';
import { Activity, Lock, ShieldCheck, User } from 'lucide-react';

const loginSchema = z.object({
  login: z.string().min(1, 'Identifiant requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function onSubmit(data: LoginForm) {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      if ('requires2fa' in result.payload) {
        setPreAuthToken(result.payload.preAuthToken);
      } else {
        navigate('/');
      }
    }
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!preAuthToken) return;
    setVerifying(true);
    setTwoFactorError(null);
    const result = await dispatch(verifyTwoFactorLogin({ preAuthToken, code: code.trim() }));
    setVerifying(false);
    if (verifyTwoFactorLogin.fulfilled.match(result)) {
      navigate('/');
    } else {
      setTwoFactorError(result.payload || 'Code invalide.');
    }
  }

  if (preAuthToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 mb-3">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-lexend text-2xl font-bold text-gray-900">Vérification en 2 étapes</h1>
            <p className="font-poppins text-sm text-gray-500 mt-1 text-center">
              Saisissez le code généré par votre application d'authentification
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {twoFactorError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-poppins">
                {twoFactorError}
              </div>
            )}

            <form onSubmit={onVerifyCode} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700 font-poppins">Code à 6 chiffres</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="123456"
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-poppins text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-center tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || code.trim().length !== 6}
                className="w-full h-9 rounded-md bg-gray-900 text-white text-sm font-medium font-poppins hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : null}
                {verifying ? 'Vérification...' : 'Valider'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreAuthToken(null);
                  setCode('');
                  setTwoFactorError(null);
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-700 font-poppins"
              >
                Retour à la connexion
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 mb-3">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-lexend text-2xl font-bold text-gray-900">Alice DPI</h1>
          <p className="font-poppins text-sm text-gray-500 mt-1">Dossier Patient Informatisé</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-lexend text-base font-semibold text-gray-900 mb-5">
            Connexion
          </h2>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-poppins">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700 font-poppins">Identifiant</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('login')}
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
                  className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm font-poppins text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              {errors.login && <p className="text-xs text-red-600 font-poppins">{errors.login.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700 font-poppins">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm font-poppins text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 font-poppins">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md bg-gray-900 text-white text-sm font-medium font-poppins hover:bg-gray-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 font-poppins mt-6">
          Alice DPI © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
