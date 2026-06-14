import { createFileRoute } from '@tanstack/react-router';
import { useSecurity } from '@/hooks/useSecurity';
import { Shield, Key, Fingerprint, Activity, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/dashboard/security')({
  component: SecurityDashboard,
});

function SecurityDashboard() {
  const { setupMfa, verifyMfa, registerPasskey, loading } = useSecurity();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState('');
  
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/security/dashboard')
      .then(r => r.json())
      .then(data => setDashboard(data))
      .catch(console.error);
  }, []);

  const handleMfaSetup = async () => {
    try {
      const res = await setupMfa();
      setQrCode(res.qrCodeDataUrl);
    } catch (err) {
      alert('Failed to setup MFA');
    }
  };

  const handleMfaVerify = async () => {
    try {
      const res = await verifyMfa(token);
      alert('MFA Enabled successfully! Backup codes generated.');
      setQrCode(null);
    } catch (err) {
      alert('Invalid code');
    }
  };

  const handlePasskey = async () => {
    try {
      await registerPasskey();
      alert('Passkey registered successfully');
    } catch (err) {
      alert('Passkey registration failed');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Enterprise Security
        </h1>
        <p className="text-slate-500 mt-2">Manage Multi-Factor Authentication, Passkeys, and Active Sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MFA Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Authenticator App</h3>
              <p className="text-sm text-slate-500">Protect your account with TOTP</p>
            </div>
          </div>
          
          {qrCode ? (
            <div className="space-y-4">
              <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 border rounded-lg" />
              <input 
                type="text" 
                placeholder="Enter 6-digit code" 
                className="w-full px-4 py-2 border rounded-lg"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button 
                onClick={handleMfaVerify}
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
              >
                Verify & Enable
              </button>
            </div>
          ) : (
            <button 
              onClick={handleMfaSetup}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800"
            >
              Setup MFA
            </button>
          )}
        </div>

        {/* Passkeys Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">WebAuthn Passkeys</h3>
              <p className="text-sm text-slate-500">Login instantly with biometrics</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6">Passkeys provide the highest level of security against phishing attacks.</p>
          <button 
            onClick={handlePasskey}
            disabled={loading}
            className="w-full border border-slate-300 font-medium py-2 rounded-lg hover:bg-slate-50 transition"
          >
            Register New Passkey
          </button>
        </div>

      </div>

      {/* Security Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Security Posture</h3>
        {dashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg text-center ${dashboard.riskScore >= 80 ? 'bg-green-50 text-green-700' : dashboard.riskScore >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
              <div className="text-3xl font-bold">{dashboard.riskScore}</div>
              <div className="text-sm mt-1">Risk Score</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-slate-50 text-slate-700">
              <div className="text-3xl font-bold">{dashboard.activeAlerts?.length || 0}</div>
              <div className="text-sm mt-1">Active Alerts</div>
            </div>
            <div className="p-4 rounded-lg text-center bg-slate-50 text-slate-700">
              <div className="text-3xl font-bold">{dashboard.recentEvents?.length || 0}</div>
              <div className="text-sm mt-1">Recent Events</div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Loading metrics...</p>
        )}
      </div>

      {/* Audit Log Stub */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg">Recent Security Events</h3>
        </div>
        <div className="space-y-4">
          {dashboard?.recentEvents?.length > 0 ? (
            dashboard.recentEvents.map((event: any) => (
              <div key={event.id} className="flex justify-between border-b pb-2">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{event.action}</span>
                  <span className="text-xs text-slate-500">{event.ipAddress} | {new Date(event.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Smartphone className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No suspicious activity detected recently.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
