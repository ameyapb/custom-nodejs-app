import {
  insertNewResource,
  findResourceById,
  findResourcesByUserId,
  findReferenceImagesByUserId,
  findGeneratedImagesByUserId,
  deleteResourceById,
  updateResourceFile,
} from "../db/queries/resourceQueries.js";
import {
  saveImageFile,
  deleteImageFile,
  readImageFile,
} from "./imageStorageService.js";
import logger from "../utils/system/logger.js";

export async function createImageResource(
  userId,
  imageBuffer,
  originalFilename,
  mimeType,
  imageType = "uploaded"
) {
  try {
    const { filename, filePath, fileSizeBytes } = await saveImageFile(
      imageBuffer,
      originalFilename
    );

    const newResource = await insertNewResource(
      userId,
      filename,
      filePath,
      fileSizeBytes,
      mimeType,
      imageType
    );

    return {
      errorOccurred: false,
      resource: newResource,
    };
  } catch (err) {
    logger.error(`Failed to create image resource for user ${userId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to create image resource",
    };
  }
}

export async function retrieveImageResource(resourceId, userId) {
  try {
    const resource = await findResourceById(resourceId);

    if (!resource) {
      return {
        errorOccurred: true,
        errorStatusCode: 404,
        errorMessage: "Resource not found",
      };
    }

    if (resource.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt. resourceId=${resourceId} userId=${userId}. [module=services/resource, event=unauthorized_access]`
      );
      return {
        errorOccurred: true,
        errorStatusCode: 403,
        errorMessage: "Unauthorized to access this resource",
      };
    }

    const imageBuffer = await readImageFile(resource.file_path);

    return {
      errorOccurred: false,
      resource,
      imageBuffer,
    };
  } catch (err) {
    logger.error(`Failed to retrieve resource ${resourceId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to retrieve image resource",
    };
  }
}

export async function deleteImageResource(resourceId, userId) {
  try {
    const resource = await findResourceById(resourceId);

    if (!resource) {
      return {
        errorOccurred: true,
        errorStatusCode: 404,
        errorMessage: "Resource not found",
      };
    }

    if (resource.user_id !== userId) {
      logger.warn(
        `Unauthorized deletion attempt. resourceId=${resourceId} userId=${userId}. [module=services/resource, event=unauthorized_delete]`
      );
      return {
        errorOccurred: true,
        errorStatusCode: 403,
        errorMessage: "Unauthorized to delete this resource",
      };
    }

    try {
      await deleteImageFile(resource.file_path);
    } catch (err) {
      logger.warn(
        `Failed to delete image file on disk for resource ${resourceId}`,
        err
      );
    }

    await deleteResourceById(resourceId);

    return {
      errorOccurred: false,
      message: "Resource deleted successfully",
    };
  } catch (err) {
    logger.error(`Failed to delete resource ${resourceId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to delete image resource",
    };
  }
}

export async function listUserResources(userId) {
  try {
    const resources = await findResourcesByUserId(userId);
    return {
      errorOccurred: false,
      resources,
    };
  } catch (err) {
    logger.error(`Failed to list resources for user ${userId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to list resources",
    };
  }
}

export async function listImageResources(userId, options = {}) {
  try {
    if (options.referencesOnly) {
      // Use the dedicated function for reference images
      const resources = await findReferenceImagesByUserId(userId);
      return {
        errorOccurred: false,
        resources,
      };
    }

    // Fallback for any other case
    const { runQuery } = await import("../db/queryRunner.js");
    let query = "SELECT * FROM resources WHERE user_id = $1";
    const params = [userId];
    query += " ORDER BY created_at DESC";
    const result = await runQuery(query, params);

    return { errorOccurred: false, resources: result.rows };
  } catch (err) {
    logger.error(
      `Failed to list image resources. userId=${userId}. [module=services/resource, event=list_failed]`,
      { message: err.message }
    );
    return {
      errorOccurred: true,
      errorMessage: "Failed to retrieve resources",
      errorStatusCode: 500,
    };
  }
}

export async function listGeneratedImages(userId) {
  try {
    const resources = await findGeneratedImagesByUserId(userId);
    return {
      errorOccurred: false,
      resources,
    };
  } catch (err) {
    logger.error(`Failed to list generated images for user ${userId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to list generated images",
    };
  }
}

export async function updateImageResource(
  resourceId,
  userId,
  imageBuffer,
  originalFilename,
  mimeType
) {
  try {
    const resource = await findResourceById(resourceId);
    if (!resource) {
      return {
        errorOccurred: true,
        errorStatusCode: 404,
        errorMessage: "Resource not found",
      };
    }
    if (resource.user_id !== userId) {
      return {
        errorOccurred: true,
        errorStatusCode: 403,
        errorMessage: "Unauthorized to update this resource",
      };
    }

    // Save new file first
    const {
      filename: newFilename,
      filePath: newFilePath,
      fileSizeBytes,
    } = await saveImageFile(imageBuffer, originalFilename);

    // Try to update DB to point to new file
    let updatedResource;
    try {
      updatedResource = await updateResourceFile(
        resourceId,
        newFilename,
        newFilePath,
        fileSizeBytes,
        mimeType
      );
    } catch (dbErr) {
      // rollback: remove newly saved file
      try {
        await deleteImageFile(newFilePath);
      } catch {
        // ignore cleanup errors
      }
      logger.error(`DB update failed for resource ${resourceId}`, dbErr);
      return {
        errorOccurred: true,
        errorStatusCode: 500,
        errorMessage: "Failed to update resource metadata",
      };
    }

    // On success, remove old file
    try {
      await deleteImageFile(resource.file_path);
    } catch (delErr) {
      logger.warn(
        `Failed to delete old image file for resource ${resourceId}`,
        delErr
      );
    }

    return {
      errorOccurred: false,
      resource: updatedResource,
    };
  } catch (err) {
    logger.error(`Failed to update image resource ${resourceId}`, err);
    return {
      errorOccurred: true,
      errorStatusCode: 500,
      errorMessage: "Failed to update image resource",
    };
  }
}
