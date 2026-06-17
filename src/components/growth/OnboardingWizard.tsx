import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, Calendar } from "lucide-react";

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [emails, setEmails] = useState("");

  const handleNext = () => setStep(step + 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg p-8 space-y-6">
        {step === 1 && (
          <div className="text-center space-y-4">
            <Sparkles className="w-12 h-12 text-blue-600 mx-auto" />
            <h2 className="text-2xl font-bold">Welcome to Nexus AI</h2>
            <p className="text-slate-500">
              Let's get your workspace perfectly tuned to your workflow in 60 seconds.
            </p>
            <Button onClick={handleNext} className="w-full mt-4">
              Let's Go
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Invite Your Team</h2>
            </div>
            <p className="text-sm text-slate-500">
              Nexus is 10x better with your team. Invite them now to instantly collaborate on
              meetings and documents.
            </p>
            <Input
              placeholder="comma separated emails (e.g. sarah@acme.com, john@acme.com)"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={handleNext}>
                Skip
              </Button>
              <Button onClick={handleNext}>Send Invites</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <Calendar className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">You're All Set!</h2>
            <p className="text-slate-500">
              Time to experience the future of work. Your AI assistant is waiting.
            </p>
            <Button onClick={() => setStep(0)} className="w-full mt-4">
              Enter Workspace
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
