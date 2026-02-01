import axios from "axios";
import { config } from "../config/environment.js";

async function ping(url, path = "") {
  const full = `${url.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  try {
    const res = await axios.get(full, { timeout: 5000 });
    console.log(`OK  ${full} -> ${res.status}`);
    return { ok: true, status: res.status, data: res.data };
  } catch (err) {
    console.error(
      `ERR ${full} -> ${err.message}${err.response ? ` (status ${err.response.status})` : ""}`
    );
    return { ok: false, error: err };
  }
}

async function main() {
  const base = config.comfyUiUrl;
  if (!base) {
    console.error("COMFYUI_URL not configured (set COMFYUI_URL in .env)");
    process.exit(2);
  }

  console.log(`Testing ComfyUI URL: ${base}`);
  await ping(base, ""); // root
  await ping(base, "sdapi/v1/version"); // common sdapi endpoint (adjust if different)
  process.exit(0);
}

main();
