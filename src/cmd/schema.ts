/**
 * Write the API's machine-readable contract: the OpenAPI 3.1 document, whose
 * response schemas are the JSON Schema description of every route's body.
 *
 * A consumer — the frontend above all — can validate its own fixtures against
 * this file instead of re-declaring the response shapes and hoping they match.
 * The tests check the same document, so an artifact that is published and an
 * artifact that is tested cannot diverge.
 *
 * Usage: npm run schema [path]     (default: api-schema.json)
 */
import { writeFileSync } from "node:fs";
import { buildOpenApiDocument } from "../routes/openapi.ts";
import { logger } from "../lib/logger.ts";

/**
 * The networks the deployment serves, read from the same variables
 * `networkConfigs` reads. Only the names go into the document, so the export
 * needs no contract ids and can run in CI without a `.env`.
 */
function networkNames(env: NodeJS.ProcessEnv): string[] {
  const names = [env.STELLAR_NETWORK?.trim() || "testnet"];
  for (const name of (env.NETWORKS ?? "").split(",").map((part) => part.trim())) {
    if (name !== "" && !names.includes(name)) names.push(name);
  }
  return names;
}

const target = process.argv[2] ?? "api-schema.json";
const document = buildOpenApiDocument({ networks: networkNames(process.env) });
writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`, "utf8");
logger.info({ path: target, paths: Object.keys(document.paths).length }, "exported the API schema");
