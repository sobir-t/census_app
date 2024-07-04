import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "email is required",
  }),
  password: z.string().min(1, {
    message: "password is required",
  }),
});

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "Minimum 6 character required!",
    })
    .max(20, {
      message: "Maximum 20 characters!",
    }),
  name: z.string().min(1, {
    message: "Name is required!",
  }),
  image: z.string(),
});

export const UpdateUserSchema = z.object({
  id: z.number().min(1, {
    message: "Id is required!",
  }),
  email: z.string().email().optional(),
  name: z
    .string()
    .min(1, {
      message: "Name is required!",
    })
    .optional(),
  image: z.string().optional(),
});

export const UpdatePasswordSchema = z.object({
  id: z.number().min(1, {
    message: "Id is required!",
  }),
  oldPassword: z
    .string()
    .min(6, {
      message: "Minimum 6 character required!",
    })
    .max(20, {
      message: "Maximum 20 characters!",
    }),
  newPassword: z
    .string()
    .min(6, {
      message: "Minimum 6 character required!",
    })
    .max(20, {
      message: "Maximum 20 characters!",
    }),
});
