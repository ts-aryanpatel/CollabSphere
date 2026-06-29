import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { signupSchema, loginSchema} from "../validators/authValidate.js";

const router = express.Router();

// Signup route
router.post('/signup', validate({ body: signupSchema }), registerUser);

// Login route
router.post('/login', validate({ body: loginSchema }), loginUser);

// Logout route
router.post('/logout', logoutUser);


export default router;