import { Router } from "express";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validationMiddleware";
import authController from "../controllers/authController";

const router = Router();

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

export default router;
