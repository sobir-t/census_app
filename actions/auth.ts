"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { LoginSchema, RegisterSchema } from "@/schemas";
import { auth, signIn, signOut } from "@/auth";
import { getUserByEmail, getUserById, saveNewUser } from "@/data/user";
import { User } from "@prisma/client";

export const login = async (
  credentials: z.infer<typeof LoginSchema>,
  redirectTo?: string
): Promise<{ success?: string; error?: string; data?: any }> => {
  const validatedFields = LoginSchema.safeParse(credentials);

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

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
  values: z.infer<typeof RegisterSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string }> => {
  const validatedFields = RegisterSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) {
    return { error: "Invalid fields!", data: validatedFields.error?.errors };
  }

  const { email, password, name } = validatedFields.data;

  if (await getUserByEmail(email)) {
    return { error: "Email already in use!" };
  }

  const { user, db_error } = await saveNewUser({
    name,
    email,
    password: await bcrypt.hash(password, 10),
  });

  if (user) return { success: "Succsessfully registered new user!", user };
  else {
    return { error: "Failed to save new user", db_error };
  }
};

export const isAdmin = async () => {
  const session = await auth();
  const user = await getUserById(parseInt(session?.user?.id as string));
  return String(user?.role) == "ADMIN";
};
