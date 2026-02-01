import { verifyAndDecodeSignedToken } from "../utils/auth/jsonWebTokenUtil.js";
import logger from "../utils/system/logger.js";

export function authenticateRequestViaJsonWebToken(req, res, next) {
  const authorizationHeaderValue = req.headers.authorization;

  if (
    !authorizationHeaderValue ||
    !authorizationHeaderValue.startsWith("Bearer ")
  ) {
    logger.warn(
      "Missing or malformed authorization header. [module=middleware/authentication, event=missing_token]"
    );
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization token" });
  }

  const extractedToken = authorizationHeaderValue.split(" ")[1];

  try {
    const decodedTokenPayload = verifyAndDecodeSignedToken(extractedToken);
    req.authenticatedUserAccountId = decodedTokenPayload.userAccountId;
    req.authenticatedUserRole = decodedTokenPayload.assignedApplicationRole;
    next();
  } catch (tokenVerificationError) {
    logger.warn(
      "Token verification failed. [module=middleware/authentication, event=invalid_token]",
      tokenVerificationError
    );
    return res
      .status(401)
      .json({ message: "Invalid or expired authorization token" });
  }
}
