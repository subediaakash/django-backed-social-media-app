import { z } from "zod";

// Signin schema
export const signinSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long"),
});

// Signup schema
export const signupSchema = z
    .object({
        firstName: z
            .string()
            .min(1, "First name is required")
            .min(2, "First name must be at least 2 characters")
            .max(50, "First name must be less than 50 characters"),
        lastName: z
            .string()
            .min(1, "Last name is required")
            .min(2, "Last name must be at least 2 characters")
            .max(50, "Last name must be less than 50 characters"),
        username: z
            .string()
            .min(1, "Username is required")
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must be less than 30 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address"),
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

// Types inferred from schemas
export type SigninFormData = z.infer<typeof signinSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
