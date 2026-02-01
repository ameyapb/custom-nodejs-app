import express from "express";
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
 *     description: Creates a new user account and returns a JWT token
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 signedAuthenticationToken:
 *                   type: string
 *                 userAccountId:
 *                   type: integer
 *                 assignedApplicationRole:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
authenticationRouter.post(
  "/register",
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
 *     description: Authenticates user and returns a JWT token
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 signedAuthenticationToken:
 *                   type: string
 *                 userAccountId:
 *                   type: integer
 *                 assignedApplicationRole:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
authenticationRouter.post(
  "/login",
  loginRequestValidationRules,
  handleUserLoginRequest
);

export default authenticationRouter;
