"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError, Session } from "next-auth";

import { LoginSchema, RegisterUserSchema } from "@/schemas";
import { auth, signIn, signOut, unstable_update } from "@/auth";
import { dbGetUserByEmail, dbSaveNewUser } from "@/data/dbUsers";
import { User } from "@prisma/client";
import { AuthUser } from "@/types/types";

/**
 * User extracted from session and modified type from User from next-auth to AuthUser that has parameter role added
 * @returns AuthUser: {
 *   id: number,
 *   name: string,
 *   email: email format,
 *   image: string,
 *   role: "USER" | "ADMIN"
 * }
 */
export const getAuthUser = async (): Promise<AuthUser> => {
  return (await auth())?.user as AuthUser;
};

export const wait = async (seconds: number = 1): Promise<void> => {
  return new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));
};

export const login = async (
  credentials: z.infer<typeof LoginSchema>,
  redirectTo?: string
): Promise<{ success?: string; error?: string; data?: any; code: number }> => {
  const validatedFields = LoginSchema.safeParse(credentials);

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await dbGetUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) return { error: "Email does not exist!", code: 404 };

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: !!redirectTo,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
        case "CallbackRouteError":
          return { error: "Invalid credentials!", code: 401 };
        default:
          return { error: "Something went wrong!", code: 500 };
      }
    }
    throw error;
  }

  return { success: "Successful login.", code: 200 };
};

export const logout = async (): Promise<{ error?: string; code: number }> => {
  try {
    await signOut({ redirectTo: "/" });
    return { code: 200 };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!", code: 401 };
        default:
          return { error: "Something went wrong!", code: 500 };
      }
    }
    throw error;
  }
};

export const updateAuthUser = async (data: Partial<Session | { user: Partial<Session["user"]> }>): Promise<Session | null> => {
  return unstable_update(data);
};
