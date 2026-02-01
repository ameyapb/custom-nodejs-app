import express from "express";
import {
  registrationRateLimiter,
  loginRateLimiter,
} from "../middleware/rateLimitMiddleware.js";
import {
  registrationRequestValidationRules,
  loginRequestValidationRules,
} from "../utils/auth/validators/userAccountValidator.js";
import {
  handleUserRegistrationRequest,
  handleUserLoginRequest,
} from "../controllers/userAccountController.js";

const authenticationRouter = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user account
 *     description: Creates a new user account and returns a JWT token. Rate limited to 5 registrations per IP per 15 minutes.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - plainTextPassword
 *               - assignedApplicationRole
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               plainTextPassword:
 *                 type: string
 *                 minLength: 8
 *               assignedApplicationRole:
 *                 type: string
 *                 enum: [admin, editor, viewer]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 *       429:
 *         description: Too many registration attempts
 */
authenticationRouter.post(
  "/register",
  registrationRateLimiter,
  registrationRequestValidationRules,
  handleUserRegistrationRequest
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to existing account
 *     description: Authenticates user and returns a JWT token. Rate limited to 10 attempts per IP per 15 minutes.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailAddress
 *               - plainTextPassword
 *             properties:
 *               emailAddress:
 *                 type: string
 *                 format: email
 *               plainTextPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
authenticationRouter.post(
  "/login",
  loginRateLimiter,
  loginRequestValidationRules,
  handleUserLoginRequest
);

export default authenticationRouter;
