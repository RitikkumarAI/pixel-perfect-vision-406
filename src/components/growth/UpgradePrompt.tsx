import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Zap } from 'lucide-react';

export function UpgradePrompt({ featureName, onUpgrade }: { featureName: string, onUpgrade: () => void }) {
  return (
    <Card className="p-8 text-center bg-gradient-to-b from-white to-indigo-50 border-indigo-100 shadow-md">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Unlock {featureName}</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        This is a Pro feature. Upgrade your workspace to unlock advanced AI capabilities, unlimited meeting transcripts, and custom agent deployments.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" onClick={onUpgrade} className="bg-indigo-600 hover:bg-indigo-700">
          <Zap className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
        <span className="text-sm text-slate-500">Starts at $15/user/mo</span>
      </div>
    </Card>
  );
}
