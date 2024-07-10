"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError, Session } from "next-auth";

import { LoginSchema, RegisterUserSchema } from "@/schemas";
import { auth, signIn, signOut, unstable_update } from "@/auth";
import { dbGetUserByEmail, dbSaveNewUser } from "@/data/dbUsers";
import { User } from "@prisma/client";

export const getAuthUser = async () => {
  return (await auth())?.user;
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

export const register = async (
  values: z.infer<typeof RegisterUserSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = RegisterUserSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 401 };
  }

  const { email, password, name, image } = validatedFields.data;

  if (await dbGetUserByEmail(email)) {
    return { error: "Email already in use!", code: 403 };
  }

  const { user, db_error } = await dbSaveNewUser({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    image,
  });

  if (user) return { success: "Successfully registered new user!", user, code: 201 };
  else {
    return { error: "Failed to save new user", db_error, code: 500 };
  }
};

export const updateAuthUser = async (data: Partial<Session | { user: Partial<Session["user"]> }>): Promise<Session | null> => {
  return unstable_update(data);
};

export const checkPermission = async ({
  userId,
  errorMessage,
}: {
  userId: number;
  errorMessage: string;
}): Promise<{ error?: string; code: number }> => {
  const currentUser = (await auth())?.user;
  if (userId != parseInt(currentUser?.id as string) && currentUser?.role != "ADMIN") return { error: errorMessage, code: 401 };
  else return { code: 200 };
};
