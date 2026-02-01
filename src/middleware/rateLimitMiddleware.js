import rateLimit from "express-rate-limit";
import logger from "../utils/system/logger.js";

// Strict limit for registration (prevent spam signups)
export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 registrations per IP per 15 minutes
  message: "Too many registration attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Log rate limit hits
    if (res.statusCode === 429) {
      logger.warn(
        `Rate limit exceeded for registration. ip=${req.ip}. [module=middleware/rateLimit, event=rate_limit_hit]`
      );
    }
    return false;
  },
});

// Moderate limit for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per IP per 15 minutes
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    if (res.statusCode === 429) {
      logger.warn(
        `Rate limit exceeded for login. ip=${req.ip}. [module=middleware/rateLimit, event=rate_limit_hit]`
      );
    }
    return false;
  },
});

// General API rate limiter (for authenticated routes)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
});
