import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({
    message: "email is required",
  }),
  password: z.string().min(1, {
    message: "password is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, {
      message: "Minimu 6 character required!",
    })
    .max(20, {
      message: "Maximum 20 characters!",
    }),
  name: z.string().min(1, {
    message: "Name is required!",
  }),
});
