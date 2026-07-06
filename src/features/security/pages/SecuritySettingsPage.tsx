import { useState } from 'react';
import { PageHeader } from '@/components/layout/Layout';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { setupTwoFactor, enableTwoFactor, disableTwoFactor, type TwoFactorSetup } from '../twoFactorApi';
import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

type Step = 'idle' | 'configuring';

export function SecuritySettingsPage() {
  const { toastSuccess, toastError } = useToast();
  // L'info "2FA active" n'étant pas portée par le JWT, l'état affiché est local à la session
  // de configuration. La source de vérité reste le compte côté serveur.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSetup() {
    setBusy(true);
    try {
      const data = await setupTwoFactor();
      setSetup(data);
      setStep('configuring');
    } catch {
      toastError("Impossible de démarrer la configuration 2FA.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnable() {
    setBusy(true);
    try {
      await enableTwoFactor(code.trim());
      setEnabled(true);
      setStep('idle');
      setSetup(null);
      setCode('');
      toastSuccess('Double authentification activée.');
    } catch {
      toastError('Code invalide. Réessayez.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    try {
      await disableTwoFactor(code.trim());
      setEnabled(false);
      setCode('');
      toastSuccess('Double authentification désactivée.');
    } catch {
      toastError('Code invalide.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Sécurité du compte" subtitle="Double authentification (TOTP)" />

      <div className="max-w-2xl space-y-5">
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              {enabled ? (
                <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-amber-500 shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-lexend font-semibold text-gray-900">Authentification à deux facteurs</h3>
                  {enabled === true && <Badge variant="success">Activée</Badge>}
                  {enabled === false && <Badge variant="warning">Désactivée</Badge>}
                </div>
                <p className="text-sm text-gray-500 mt-1 font-poppins">
                  Ajoute un code à usage unique (application type Google Authenticator, FreeOTP, Authy)
                  en complément du mot de passe.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {step === 'idle' && (
          <Card>
            <CardBody>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600 font-poppins">
                  Configurez un nouveau secret puis validez avec un code pour activer la 2FA.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleSetup} loading={busy} icon={<KeyRound className="h-4 w-4" />}>
                    Configurer / renouveler
                  </Button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Désactiver la 2FA</p>
                  <div className="flex items-end gap-2">
                    <div className="w-40">
                      <Input label="Code actuel" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" />
                    </div>
                    <Button variant="outline" onClick={handleDisable} loading={busy}>
                      Désactiver
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {step === 'configuring' && setup && (
          <Card>
            <CardBody>
              <h3 className="font-lexend font-semibold text-gray-900 mb-3">Étapes de configuration</h3>
              <ol className="list-decimal ml-5 space-y-3 text-sm text-gray-700 font-poppins">
                <li>
                  Ajoutez cette clé dans votre application d'authentification (saisie manuelle) :
                  <div className="mt-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 font-mono text-sm break-all select-all">
                    {setup.secret}
                  </div>
                </li>
                <li>
                  Ou collez l'URI d'appairage :
                  <div className="mt-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 font-mono text-xs break-all select-all">
                    {setup.otpauthUri}
                  </div>
                </li>
                <li>
                  Saisissez le code à 6 chiffres généré pour valider :
                  <div className="mt-2 flex items-end gap-2">
                    <div className="w-40">
                      <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" inputMode="numeric" />
                    </div>
                    <Button onClick={handleEnable} loading={busy}>Activer</Button>
                    <Button variant="ghost" onClick={() => { setStep('idle'); setSetup(null); setCode(''); }}>Annuler</Button>
                  </div>
                </li>
              </ol>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
