import axios from "axios";
import FormData from "form-data";
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
 * Upload an image to ComfyUI's input directory.
 * Returns the uploaded filename that can be used in LoadImage nodes.
 */
export async function uploadImageToComfy(imageBuffer, originalFilename) {
  const formData = new FormData();
  formData.append("image", imageBuffer, {
    filename: originalFilename,
    contentType: "image/png",
  });

  const url = `${baseUrl()}/upload/image`;

  try {
    const res = await axios.post(url, formData, {
      headers: {
        ...authHeaders(),
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    // ComfyUI returns { name: "uploaded_filename.png" }
    if (!res.data?.name) {
      throw new Error("ComfyUI upload response missing 'name' field");
    }

    return {
      errorOccurred: false,
      name: res.data.name,
      subfolder: res.data.subfolder || "",
      type: res.data.type || "input",
    };
  } catch (err) {
    logger.error(
      `Failed to upload image to ComfyUI: ${url}. [module=services/comfyUi, event=upload_failed]`,
      {
        message: err.message,
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
