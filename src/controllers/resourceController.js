import {
  createImageResource,
  retrieveImageResource,
  deleteImageResource,
  updateImageResource,
  listUserResources,
} from "../services/resourceService.js";
import logger from "../utils/system/logger.js";

// ─── Response shape ──────────────────────────────────────────────────────────
// Strip the absolute server path before sending resource metadata to the client.
// Everything else (id, user_id, filename, mime_type, sizes, timestamps) is safe.
function mapResourceForResponse(dbRow) {
  return {
    id: dbRow.id,
    userId: dbRow.user_id,
    filename: dbRow.filename,
    fileSizeBytes: dbRow.file_size_bytes,
    mimeType: dbRow.mime_type,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
  };
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
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
      resource: mapResourceForResponse(result.resource),
    });
  } catch (err) {
    logger.error(
      "Resource creation failed unexpectedly. [module=controllers/resource, event=create_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

// ─── LIST ────────────────────────────────────────────────────────────────────
export async function handleListResourcesRequest(req, res) {
  try {
    const userId = req.authenticatedUserAccountId;

    const result = await listUserResources(userId);

    if (result.errorOccurred) {
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    logger.info(
      `Resources listed. userId=${userId} count=${result.resources.length}. [module=controllers/resource, event=list_success]`
    );

    return res.status(200).json({
      resources: result.resources.map(mapResourceForResponse),
    });
  } catch (err) {
    logger.error(
      "Resource listing failed unexpectedly. [module=controllers/resource, event=list_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

// ─── READ ────────────────────────────────────────────────────────────────────
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

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function handleUpdateResourceRequest(req, res) {
  try {
    const { resourceId } = req.params;
    const userId = req.authenticatedUserAccountId;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "No image file provided for update" });
    }

    const result = await updateImageResource(
      resourceId,
      userId,
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (result.errorOccurred) {
      logger.error(
        `Failed to update resource ${resourceId} for user ${userId}. [module=controllers/resource, event=update_failed]`
      );
      return res
        .status(result.errorStatusCode)
        .json({ message: result.errorMessage });
    }

    logger.info(
      `Resource updated. id=${result.resource.id} userId=${userId}. [module=controllers/resource, event=update_success]`
    );

    return res.status(200).json({
      message: "Resource updated",
      resource: mapResourceForResponse(result.resource),
    });
  } catch (err) {
    logger.error(
      "Resource update failed unexpectedly. [module=controllers/resource, event=update_error]",
      err
    );
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
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
