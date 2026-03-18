import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deploymentTemplates } from '@/lib/deploymentConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStoreOpsStore } from '@/stores/storeOpsStore';

export function SetupWizardPage(): JSX.Element {
  const navigate = useNavigate();
  const storeProfile = useStoreOpsStore((state) => state.storeProfile);
  const setDeploymentProfile = useStoreOpsStore((state) => state.setDeploymentProfile);
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState<string>('All In One');
  const [storeNameInput, setStoreNameInput] = useState<string>(storeProfile.storeName);
  const [storeCodeInput, setStoreCodeInput] = useState<string>(storeProfile.storeCode);
  const [addressInput, setAddressInput] = useState<string>(storeProfile.address);

  const selectedTemplate = useMemo(
    () => deploymentTemplates.find((template) => template.label === selectedTemplateLabel) ?? deploymentTemplates[deploymentTemplates.length - 1],
    [selectedTemplateLabel]
  );

  const handleContinue = (): void => {
    setDeploymentProfile({
      businessType: selectedTemplate.businessType,
      primaryIndustry: selectedTemplate.primaryIndustry,
      enabledIndustries: selectedTemplate.enabledIndustries,
      enabledFeatures: selectedTemplate.enabledFeatures,
      storeName: storeNameInput,
      storeCode: storeCodeInput,
      address: addressInput
    });
    navigate('/app', { replace: true });
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.25),_transparent_32%),linear-gradient(180deg,_#082f49_0%,_#020617_100%)] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">First Run Deployment</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Setup Wizard</h1>
          <p className="mt-3 text-sm text-slate-300">
            Choose the deployment profile once, generate the correct feature surface, and then continue into the operational modules.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-cyan-400/20 bg-slate-950/70 text-slate-100 shadow-2xl">
            <CardHeader>
              <CardTitle>Choose Deployment Template</CardTitle>
              <CardDescription className="text-slate-400">Templates map directly to enabled industries and screens.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {deploymentTemplates.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  className={
                    selectedTemplate.label === template.label
                      ? 'rounded-2xl border border-cyan-300 bg-cyan-400/15 p-4 text-left shadow-lg'
                      : 'rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left'
                  }
                  onClick={() => setSelectedTemplateLabel(template.label)}
                >
                  <p className="text-sm font-semibold">{template.label}</p>
                  <p className="mt-2 text-xs text-slate-400">{template.businessType}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">Industries</p>
                  <p className="mt-1 text-sm text-slate-300">{template.enabledIndustries.join(', ')}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">Features</p>
                  <p className="mt-1 text-sm text-slate-300">{template.enabledFeatures.length}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-cyan-400/20 bg-slate-950/70 text-slate-100 shadow-2xl">
            <CardHeader>
              <CardTitle>Store Identity</CardTitle>
              <CardDescription className="text-slate-400">This will be applied together with the selected template.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input aria-label="Setup Store Name" value={storeNameInput} onChange={(event) => setStoreNameInput(event.target.value)} placeholder="Store name" className="border-slate-700 text-slate-100" />
              <Input aria-label="Setup Store Code" value={storeCodeInput} onChange={(event) => setStoreCodeInput(event.target.value)} placeholder="Store code" className="border-slate-700 text-slate-100" />
              <Input aria-label="Setup Store Address" value={addressInput} onChange={(event) => setAddressInput(event.target.value)} placeholder="Address" className="border-slate-700 text-slate-100" />

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Selected Outcome</p>
                <p className="mt-2 text-lg font-semibold">{selectedTemplate.businessType}</p>
                <p className="mt-2 text-sm text-slate-300">Primary industry: {selectedTemplate.primaryIndustry}</p>
                <p className="mt-1 text-sm text-slate-300">Enabled modules: {selectedTemplate.enabledFeatures.length}</p>
              </div>

              <Button type="button" className="w-full" onClick={handleContinue} disabled={!storeNameInput.trim() || !storeCodeInput.trim()}>
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
