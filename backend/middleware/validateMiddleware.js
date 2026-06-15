import { z } from 'zod';

export const signupSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(2, { message: "Name must be at least 2 characters" }),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email({ message: "Invalid email address" }),
    password: z
        .string({ required_error: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .trim()
        .email({ message: 'Invalid email address format' }),
    password: z
        .string({ required_error: 'Password is required' }),
});

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.errors.map((err) => ({
                field: err.path[0],
                message: err.message,
            })),
        });
    }
};