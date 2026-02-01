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

authenticationRouter.post(
  "/register",
  registrationRequestValidationRules,
  handleUserRegistrationRequest
);

authenticationRouter.post(
  "/login",
  loginRequestValidationRules,
  handleUserLoginRequest
);

export default authenticationRouter;
