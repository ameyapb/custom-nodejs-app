import axios from "axios";
import { config } from "../config/environment.js";
import logger from "../utils/system/logger.js";

function ensureConfigured() {
  if (!config.comfyUiUrl) {
    throw new Error("COMFYUI_URL is not configured");
  }
}

export async function callComfyApi(
  path,
  method = "post",
  data = {},
  opts = {}
) {
  ensureConfigured();
  const base = config.comfyUiUrl.replace(/\/+$/, "");
  const url = `${base}/${String(path).replace(/^\/+/, "")}`;

  const headers = {};
  if (config.comfyUiApiKey)
    headers["Authorization"] = `Bearer ${config.comfyUiApiKey}`;

  try {
    const res = await axios({
      url,
      method,
      data,
      headers,
      timeout: opts.timeout ?? 60000,
    });
    return { errorOccurred: false, status: res.status, data: res.data };
  } catch (err) {
    logger.error(
      `ComfyUI API call failed: ${method.toUpperCase()} ${url}`,
      err
    );
    return {
      errorOccurred: true,
      errorMessage: err.message,
      status: err.response?.status,
      details: err.response?.data,
    };
  }
}
/**
 * Convenience: generate images from a prompt using a common sdapi endpoint.
 * Adjust path/payload to match your ComfyUI deployment.
 */
export async function generateFromPrompt(payload) {
  // Example path used by many SD APIs; change if your ComfyUI differs.
  return callComfyApi("sdapi/v1/txt2img", "post", payload);
}

export async function getJobStatus(jobId) {
  return callComfyApi(`jobs/${jobId}`, "get");
}

export async function checkComfyUI() {
  const start = Date.now();
  const result = await callComfyApi("/", "get", {}, { timeout: 5000 });

  if (result.errorOccurred) {
    return {
      status: "down",
      error: result.status ? `HTTP ${result.status}` : result.errorMessage,
    };
  }

  return { status: "ok", latencyMs: Date.now() - start };
}
