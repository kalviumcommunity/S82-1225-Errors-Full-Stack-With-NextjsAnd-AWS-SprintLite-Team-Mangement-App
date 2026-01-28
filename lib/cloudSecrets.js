// lib/cloudSecrets.js
// Utility to fetch secrets from AWS Secrets Manager or Azure Key Vault at runtime

// AWS Example
import AWS from "aws-sdk";

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION });

export async function getCloudSecrets() {
  if (!process.env.SECRET_ARN) throw new Error("SECRET_ARN not set");
  const res = await secretsManager.getSecretValue({ SecretId: process.env.SECRET_ARN }).promise();
  return JSON.parse(res.SecretString);
}

// Azure Example (uncomment if using Azure)
// import { SecretClient } from '@azure/keyvault-secrets';
// import { DefaultAzureCredential } from '@azure/identity';
//
// const vaultUrl = `https://${process.env.KEYVAULT_NAME}.vault.azure.net`;
// const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
//
// export async function getAzureSecret(name) {
//   const secret = await client.getSecret(name);
//   return secret.value;
// }
