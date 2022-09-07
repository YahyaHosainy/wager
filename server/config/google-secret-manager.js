import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { logger } from "../config/winston.js";

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const projectId = "brave-smile-267001";
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  try {
    const [version] = await client.accessSecretVersion({ name });
    const secretValue = version.payload.data.toString();
    return secretValue;
  } catch (error) {
    logger.log("error", error);
  }
}

export default getSecret;
