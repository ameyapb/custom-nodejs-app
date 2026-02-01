import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { callComfyApi, downloadOutput } from "./comfyUiService.js";
import logger from "../utils/system/logger.js";

// ---------------------------------------------------------------------------
// Load the prompt-format workflow template once at module init.
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKFLOW_TEMPLATE = JSON.parse(
  readFileSync(
    resolve(__dirname, "..", "workflows", "simpleImageGenWorkflow.json"),
    "utf-8"
  )
);

const POLL_INTERVAL_MS = 2000; // check every 2 seconds
const POLL_TIMEOUT_MS = 300000; // give up after 5 minutes

// ---------------------------------------------------------------------------
// Build a prompt payload by injecting user text into the frozen template.
// Node 8  = positive CLIPTextEncode
// Node 11 = negative CLIPTextEncode
// ---------------------------------------------------------------------------
function buildPrompt({ positivePrompt, negativePrompt }) {
  const prompt = JSON.parse(JSON.stringify(WORKFLOW_TEMPLATE));
  prompt["8"].inputs.text = positivePrompt || "";
  prompt["11"].inputs.text = negativePrompt || "";
  return prompt;
}

// ---------------------------------------------------------------------------
// Submit the workflow to ComfyUI's queue.
// ---------------------------------------------------------------------------
async function submitWorkflow({ positivePrompt, negativePrompt }) {
  const prompt = buildPrompt({ positivePrompt, negativePrompt });
  const result = await callComfyApi("prompt", "post", { prompt });

  if (result.errorOccurred) {
    throw new Error(
      `Failed to submit workflow: ${result.errorMessage} (HTTP ${result.status})`
    );
  }

  const promptId = result.data?.prompt_id;
  if (!promptId) {
    throw new Error(
      "ComfyUI returned no prompt_id. Response: " + JSON.stringify(result.data)
    );
  }

  logger.info(
    `Workflow submitted. prompt_id=${promptId}. [module=services/comfyWorkflow, event=workflow_submitted]`
  );
  return promptId;
}

// ---------------------------------------------------------------------------
// Poll /history/{promptId} until ComfyUI finishes the job.
// ---------------------------------------------------------------------------
async function pollForCompletion(promptId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const result = await callComfyApi(
      `history/${promptId}`,
      "get",
      {},
      { timeout: 10000 }
    );

    if (result.errorOccurred) {
      if (result.status === 404) {
        await sleep(POLL_INTERVAL_MS);
        continue;
      }
      throw new Error(
        `Poll failed: ${result.errorMessage} (HTTP ${result.status})`
      );
    }

    const entry = result.data?.[promptId];
    if (!entry) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (entry.status === "error") {
      throw new Error(
        `ComfyUI job errored. prompt_id=${promptId}. Details: ${JSON.stringify(entry)}`
      );
    }

    if (entry.outputs && Object.keys(entry.outputs).length > 0) {
      logger.info(
        `Job completed. prompt_id=${promptId}. [module=services/comfyWorkflow, event=job_completed]`
      );
      return entry;
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Polling timed out after ${POLL_TIMEOUT_MS / 1000}s for prompt_id=${promptId}`
  );
}

// ---------------------------------------------------------------------------
// Extract the first image output metadata from a history entry.
// ComfyUI returns outputs keyed by node ID; each node's value is an array
// of output groups. We find the first one that contains an images array.
// ---------------------------------------------------------------------------
function extractOutputMeta(historyEntry) {
  const outputs = historyEntry?.outputs || {};

  for (const nodeId of Object.keys(outputs)) {
    const nodeOutput = outputs[nodeId];

    // Shape A: { images: [...] } — what ComfyUI actually returns
    if (nodeOutput?.images?.length > 0) {
      const img = nodeOutput.images[0];
      return {
        filename: img.filename,
        subfolder: img.subfolder || "",
        type: img.type || "output",
      };
    }

    // Shape B: [{ images: [...] }, ...] — array of output groups (fallback)
    if (Array.isArray(nodeOutput)) {
      for (const group of nodeOutput) {
        if (group?.images?.length > 0) {
          const img = group.images[0];
          return {
            filename: img.filename,
            subfolder: img.subfolder || "",
            type: img.type || "output",
          };
        }
      }
    }
  }

  throw new Error(
    "No image output found in history entry: " + JSON.stringify(outputs)
  );
}

// ---------------------------------------------------------------------------
// Orchestrator — the single entry point called by the controller.
// Submits → polls → extracts metadata → downloads the image buffer.
// ---------------------------------------------------------------------------
export async function generateImage({ positivePrompt, negativePrompt }) {
  const promptId = await submitWorkflow({ positivePrompt, negativePrompt });
  const historyEntry = await pollForCompletion(promptId);
  const outputMeta = extractOutputMeta(historyEntry);

  const download = await downloadOutput(outputMeta);
  if (download.errorOccurred) {
    throw new Error(
      `Failed to download generated image: ${download.errorMessage}`
    );
  }

  return {
    promptId,
    filename: outputMeta.filename,
    buffer: download.buffer,
    contentType: download.contentType,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
