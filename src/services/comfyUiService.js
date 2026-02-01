import axios from "axios";
import { config } from "../config/environment.js";
import logger from "../utils/system/logger.js";

function baseUrl() {
  return config.comfyUiUrl.replace(/\/+$/, "");
}

function authHeaders() {
  const headers = {};
  if (config.comfyUiApiKey)
    headers["Authorization"] = `Bearer ${config.comfyUiApiKey}`;
  return headers;
}

/**
 * Generic HTTP call to the ComfyUI instance.
 * All other functions in this file (and comfyWorkflowService) go through here.
 */
export async function callComfyApi(
  path,
  method = "post",
  data = {},
  opts = {}
) {
  const url = `${baseUrl()}/${String(path).replace(/^\/+/, "")}`;

  try {
    const res = await axios({
      url,
      method,
      data,
      headers: { ...authHeaders() },
      timeout: opts.timeout ?? 60000,
    });
    return { errorOccurred: false, status: res.status, data: res.data };
  } catch (err) {
    logger.error(
      `ComfyUI API call failed: ${method.toUpperCase()} ${url}. [module=services/comfyUi, event=api_call_failed]`,
      {
        message: err.message,
        // stack: err.stack,
        // Axios-specific info, if it exists
        status: err.response?.status ?? err.status,
        statusText: err.response?.statusText ?? err.statusText,
        url: err.config?.url ?? err.url,
        method: err.config?.method ?? err.method,
        responseData: err.response?.data ?? err.data,
      }
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
 * Health check — used by serviceHealth route.
 */
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

/**
 * Download a generated output file from ComfyUI as a Buffer.
 * ComfyUI serves files at /file={type}/{subfolder}/{filename}
 */
export async function downloadOutput({ filename, subfolder, type }) {
  const params = new URLSearchParams({
    type: type || "output",
    subfolder: subfolder || "",
    filename,
  });

  const url = `${baseUrl()}/view?${params.toString()}`;

  try {
    const res = await axios.get(url, {
      headers: { ...authHeaders() },
      responseType: "arraybuffer",
      timeout: 30000,
    });

    return {
      errorOccurred: false,
      buffer: Buffer.from(res.data),
      contentType: res.headers["content-type"] || "image/png",
    };
  } catch (err) {
    logger.error(
      `Failed to download output file: ${url}. [module=services/comfyUi, event=download_failed]`,
      {
        message: err.message,
        // stack: err.stack,
        // Axios-specific info, if it exists
        status: err.response?.status ?? err.status,
        statusText: err.response?.statusText ?? err.statusText,
        url: err.config?.url ?? err.url,
        method: err.config?.method ?? err.method,
        responseData: err.response?.data ?? err.data,
      }
    );
    return {
      errorOccurred: true,
      errorMessage: err.message,
      status: err.response?.status,
    };
  }
}
