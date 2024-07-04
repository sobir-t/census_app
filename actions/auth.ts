"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError, Session } from "next-auth";

import { LoginSchema, RegisterUserSchema } from "@/schemas";
import { auth, signIn, signOut, unstable_update } from "@/auth";
import { dbGetUserByEmail, dbSaveNewUser } from "@/data/user";
import { User } from "@prisma/client";

export const getAuthUser = async () => {
  return (await auth())?.user;
};

export const login = async (
  credentials: z.infer<typeof LoginSchema>,
  redirectTo?: string
): Promise<{ success?: string; error?: string; data?: any }> => {
  const validatedFields = LoginSchema.safeParse(credentials);

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await dbGetUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) return { error: "Email does not exist!" };

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
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }

  return { success: "Successfull login." };
};

export const logout = async () => {
  try {
    await signOut({ redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
};

export const register = async (
  values: z.infer<typeof RegisterUserSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string }> => {
  const validatedFields = RegisterUserSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors };
  }

  const { email, password, name, image } = validatedFields.data;

  if (await dbGetUserByEmail(email)) {
    return { error: "Email already in use!" };
  }

  const { user, db_error } = await dbSaveNewUser({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    image,
  });

  if (user) return { success: "Succsessfully registered new user!", user };
  else {
    return { error: "Failed to save new user", db_error };
  }
};

export const updateAuthUser = async (data: Partial<Session | { user: Partial<Session["user"]> }>): Promise<Session | null> => {
  return unstable_update(data);
};
