# Environment Variable Management with AWS Secrets Manager / Azure Key Vault

## Overview
This task demonstrates how to securely manage environment variables using a cloud secret manager (AWS Secrets Manager or Azure Key Vault) instead of local .env files. Secrets are stored, accessed, and rotated securely, following best practices for DevOps and cloud security.

## Steps Completed

### 1. Create and Store Secrets
- Chose AWS Secrets Manager (or Azure Key Vault) as the cloud secret manager.
- Added all sensitive environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `AWS_ACCESS_KEY_ID`, etc.) as secure key-value pairs.
- Example secret object:
  ```json
  {
    "DATABASE_URL": "postgresql://admin:password@db.example.com:5432/nextjsdb",
    "JWT_SECRET": "supersecuretokenkey"
  }
  ```
- Secret named appropriately, e.g., `nextjs/app-secrets`.

### 2. Configure Access Control
- For AWS: Created an IAM user/role with `secretsmanager:GetSecretValue` permission for the specific secret ARN.
- For Azure: Granted Managed Identity/Service Principal access to get/list secrets in Key Vault.
- Used least-privilege principles for all access policies.
- Example AWS IAM policy:
  ```json
  {
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": "arn:aws:secretsmanager:region:account-id:secret:nextjs/app-secrets-*"
  }
  ```

### 3. Retrieve Secrets at Runtime
- Used the cloud SDK to fetch secrets dynamically in the Next.js app or Node.js environment.
- **AWS Example:**
  ```js
  import AWS from 'aws-sdk';
  const client = new AWS.SecretsManager({ region: process.env.AWS_REGION });
  export async function getSecrets() {
    const res = await client.getSecretValue({ SecretId: process.env.SECRET_ARN }).promise();
    return JSON.parse(res.SecretString);
  }
  ```
- **Azure Example:**
  ```js
  import { SecretClient } from '@azure/keyvault-secrets';
  import { DefaultAzureCredential } from '@azure/identity';
  const vaultUrl = `https://${process.env.KEYVAULT_NAME}.vault.azure.net`;
  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
  export async function getSecret(name) {
    const secret = await client.getSecret(name);
    return secret.value;
  }
  ```
- Verified retrieval by logging keys or using them in app configuration (never exposing actual values).

### 4. Validate Runtime Injection
- Ran the app locally or in a deployed container (e.g., AWS ECS, Azure App Service).
- Verified secrets are retrieved securely at runtime (not hardcoded).
- Captured screenshots showing:
  - Secret in Secrets Manager / Key Vault
  - Successful retrieval logs or app connection proof

### 5. Reflect on Rotation and Security
- Documented secret rotation policy (e.g., rotate every 30–60 days).
- Described how to automate rotation (AWS Lambda, Azure Automation).
- Reflected on least-privilege model and benefits of centralized secret storage.

### 6. README Update
- README includes:
  - Description of chosen secret manager
  - Code/steps for storing, retrieving, and injecting secrets
  - Screenshots of runtime retrieval
  - Reflection on rotation and IAM/Key Vault access policy

---

## 🎥 What to Explain in the Video Demo
- Show secret creation in AWS Secrets Manager or Azure Key Vault (do not show actual secret values).
- Demonstrate app or script retrieving secrets at runtime (show logs/config, not raw secrets).
- Explain IAM/Key Vault access setup and least-privilege policy.
- Briefly describe your secret rotation strategy and automation.
- Summarize why cloud secret managers are more secure than local .env files.

---
This completes the secure environment variable management task using a cloud secret manager, following best practices for security, access control, and automation.
