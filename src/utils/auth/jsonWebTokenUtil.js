import jwt from "jsonwebtoken";
import { config } from "../../config/environment.js";

const JWT_EXPIRATION_DURATION = "7d";

export function generateSignedTokenForUserAccount(
  userAccountId,
  assignedApplicationRole
) {
  const tokenPayloadData = {
    userAccountId,
    assignedApplicationRole,
  };

  const signedJsonWebToken = jwt.sign(tokenPayloadData, config.jwtSecret, {
    expiresIn: JWT_EXPIRATION_DURATION,
  });

  return signedJsonWebToken;
}

export function verifyAndDecodeSignedToken(signedJsonWebToken) {
  const decodedTokenPayload = jwt.verify(signedJsonWebToken, config.jwtSecret);
  return decodedTokenPayload;
}
