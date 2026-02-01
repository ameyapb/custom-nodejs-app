import { generateFromPrompt } from "../services/comfyUiService.js";
import logger from "../utils/system/logger.js";

export async function handleGenerateFromPrompt(req, res) {
  try {
    const userId = req.authenticatedUserAccountId;
    const payload = req.body || {};

    const result = await generateFromPrompt(payload);

    if (result.errorOccurred) {
      logger.error(`ComfyUI generate failed for user ${userId}`, result);
      return res
        .status(result.status || 500)
        .json({
          message: result.errorMessage || "ComfyUI error",
          details: result.details,
        });
    }

    return res.status(200).json({ data: result.data });
  } catch (err) {
    logger.error("ComfyUI generate unexpected error", err);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
