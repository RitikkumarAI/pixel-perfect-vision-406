import { useState } from 'react';

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export const useSecurity = () => {
  const [loading, setLoading] = useState(false);

  const setupMfa = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/mfa/setup', { method: 'POST' });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async () => {
    setLoading(true);
    try {
      // 1. Get options
      const optRes = await fetch('/api/v1/auth/passkey/register/options', { method: 'POST' });
      const options = await optRes.json();

      // 2. Invoke browser WebAuthn
      const authResp = await startRegistration(options);

      // 3. Verify
      const verification = await fetch('/api/v1/auth/passkey/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authResp)
      });
      return await verification.json();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setupMfa, verifyMfa, disableMfa, registerPasskey, loading };
};
