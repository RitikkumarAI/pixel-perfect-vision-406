# INCIDENT RESPONSE PLAN (IRP)

## Severity Matrix

- **SEV-1 (CRITICAL)**: Platform offline, Data Breach, Total Database Failure. Response: 15 minutes.
- **SEV-2 (HIGH)**: Core subsystem degraded (e.g. AI Gateway failing). Response: 1 hour.
- **SEV-3 (MODERATE)**: Non-critical feature bug. Response: 1 business day.

## Escalation Chain

1. Sentry/Prometheus detects anomaly.
2. PagerDuty alerts Tier 1 On-Call Engineer.
3. Engineer triages within SLA.
4. If SEV-1, Engineer pages the Incident Commander (VP of Engineering).

## Breach Protocol

1. **Isolate**: Revoke all active sessions via Redis flush. Shut down external network ingress.
2. **Audit**: Extract `AuditLog` records spanning the last 72 hours.
3. **Notify**: Legal counsel and DPO notified. Impacted tenants notified within 72 hours per GDPR Article 33.
4. **Remediate**: Patch vulnerability. Force reset all Passkeys/MFA devices.
5. **Post-Mortem**: Document RCA (Root Cause Analysis) in `/docs/rca/`.
