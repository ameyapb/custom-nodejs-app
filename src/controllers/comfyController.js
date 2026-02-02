import { generateImage } from "../services/comfyWorkflowService.js";
import { createImageResource } from "../services/resourceService.js";
import { retrieveImageResource } from "../services/resourceService.js";
import logger from "../utils/system/logger.js";

// Same shape contract as resourceController — no file_path in responses.
function mapResourceForResponse(dbRow) {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    filename: dbRow.filename,
    fileSizeBytes: dbRow.file_size_bytes,
    mimeType: dbRow.mime_type,
    imageType: dbRow.image_type,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

export async function handleGenerateFromPrompt(req, res) {
  try {
    const userId = req.authenticatedUserAccountId;
    const { positivePrompt, negativePrompt, referenceImageResourceId } =
      req.body || {};
    const referenceImageFile = req.file; // From multer if uploaded

    if (
      !positivePrompt ||
      typeof positivePrompt !== "string" ||
      positivePrompt.trim() === ""
    ) {
      return res.status(400).json({
        message: "positivePrompt is required and must be a non-empty string.",
      });
    }

    // Handle reference image - either from upload or existing resource
    let referenceImageBuffer = null;
    let referenceImageFilename = null;

    if (referenceImageFile) {
      // User uploaded a new reference image
      referenceImageBuffer = referenceImageFile.buffer;
      referenceImageFilename = referenceImageFile.originalname;
      logger.info(
        `Using uploaded reference image. userId=${userId} filename=${referenceImageFilename}. [module=controllers/comfy, event=reference_from_upload]`
      );
    } else if (referenceImageResourceId) {
      // User selected an existing resource
      const resourceResult = await retrieveImageResource(
        referenceImageResourceId,
        userId
      );

      if (resourceResult.errorOccurred) {
        return res.status(resourceResult.errorStatusCode).json({
          message: `Failed to retrieve reference image: ${resourceResult.errorMessage}`,
        });
      }

      referenceImageBuffer = resourceResult.imageBuffer;
      referenceImageFilename = resourceResult.resource.filename;
      logger.info(
        `Using existing resource as reference image. userId=${userId} resourceId=${referenceImageResourceId}. [module=controllers/comfy, event=reference_from_resource]`
      );
    }

    logger.info(
      `Generation requested. userId=${userId} hasReferenceImage=${!!referenceImageBuffer}. [module=controllers/comfy, event=generate_requested]`
    );

    // Generate the image via ComfyUI
    const { promptId, filename, buffer, contentType } = await generateImage({
      positivePrompt: positivePrompt.trim(),
      negativePrompt: (negativePrompt || "").trim(),
      referenceImageBuffer,
      referenceImageFilename,
    });

    // Persist using the same resource pipeline as uploaded images, but mark as 'generated'
    const result = await createImageResource(
      userId,
      buffer,
      filename,
      contentType,
      "generated"
    );

    if (result.errorOccurred) {
      logger.error(
        `Failed to save generated image for user ${userId}. [module=controllers/comfy, event=save_failed]`
      );
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    logger.info(
      `Generation complete. userId=${userId} promptId=${promptId} resourceId=${result.resource.id}. [module=controllers/comfy, event=generate_success]`
    );

    return res.status(201).json({
      message: "Image generated successfully",
      promptId,
      resource: mapResourceForResponse(result.resource),
    });
  } catch (err) {
    logger.error(
      "Generation failed unexpectedly. [module=controllers/comfy, event=generate_error]",
      {
        message: err.message,
        status: err.response?.status ?? err.status,
        statusText: err.response?.statusText ?? err.statusText,
        url: err.config?.url ?? err.url,
        method: err.config?.method ?? err.method,
        responseData: err.response?.data ?? err.data,
      }
    );

    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
