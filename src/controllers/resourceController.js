import {
  createImageResource,
  retrieveImageResource,
  deleteImageResource,
} from "../services/resourceService.js";
import logger from "../utils/system/logger.js";

export async function handleCreateResourceRequest(req, res) {
  try {
    const userId = req.authenticatedUserAccountId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const result = await createImageResource(
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (result.errorOccurred) {
      logger.error(
        `Failed to create resource for user ${userId}. [module=controllers/resource, event=create_failed]`
      );
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    logger.info(
      `Resource created. id=${result.resource.id} userId=${userId}. [module=controllers/resource, event=create_success]`
    );

    return res.status(201).json({
      message: "Image resource created successfully",
      resource: result.resource,
    });
  } catch (err) {
    logger.error(
      "Resource creation failed unexpectedly. [module=controllers/resource, event=create_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

export async function handleReadResourceRequest(req, res) {
  try {
    const { resourceId } = req.params;
    const userId = req.authenticatedUserAccountId;

    const result = await retrieveImageResource(resourceId, userId);

    if (result.errorOccurred) {
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    res.setHeader("Content-Type", result.resource.mime_type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${result.resource.filename}"`
    );
    return res.send(result.imageBuffer);
  } catch (err) {
    logger.error(
      "Resource retrieval failed unexpectedly. [module=controllers/resource, event=read_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

export async function handleUpdateResourceRequest(req, res) {
  return res
    .status(501)
    .json({ message: "Resource update not yet implemented" });
}

export async function handleDeleteResourceRequest(req, res) {
  try {
    const { resourceId } = req.params;
    const userId = req.authenticatedUserAccountId;

    const result = await deleteImageResource(resourceId, userId);

    if (result.errorOccurred) {
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    logger.info(
      `Resource deleted. id=${resourceId} userId=${userId}. [module=controllers/resource, event=delete_success]`
    );

    return res.status(204).send();
  } catch (err) {
    logger.error(
      "Resource deletion failed unexpectedly. [module=controllers/resource, event=delete_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}
