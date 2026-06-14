# GDPR DATA FLOW MAP

## 1. Data Collection
- **End-User Input**: PII (Name, Email, Biometrics via WebAuthn) collected via React frontend.
- **Telemetry**: IP Addresses, GeoIP coordinates collected by Express backend for Impossible Travel logic.

## 2. Processing Boundaries
- **Core Processing**: Node.js workers process chat and meeting semantics.
- **AI Processing**: Anonymized chat contexts sent to OpenAI/Gemini endpoints via AIGateway. (Data Processing Agreements - DPAs are active with these sub-processors).
- **Payment Processing**: Delegated fully to Stripe (PCI-DSS compliant). No raw PANs touch Nexus servers.

## 3. Storage
- **Database**: PostgreSQL (AWS RDS `eu-central-1` for European tenants).
- **Blob Storage**: S3 buckets holding video recordings and meeting transcripts.

## 4. Subject Access Requests (SAR)
- Users can execute `/api/v1/user/export` to download a structured JSON dump of all DB rows tied to their User ID.
- Account deletion executes a hard cascade across Postgres and initiates an S3 deletion queue.
