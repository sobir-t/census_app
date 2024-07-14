"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { dbGetUserByEmail, dbGetUserById, dbSaveNewUser, dbUpdatePassword, dbUpdateUser } from "@/data/dbUsers";
import { RegisterUserSchema, UpdatePasswordSchema, UpdateUserSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "@prisma/client";
import { AuthUser } from "@/types/types";
import { getAuthUser } from "./actionsAuth";

/**
 * Register new user. No user authorization
 * @param values {
 *   email: email format,
 *   password: string min 6, max 20 characters
 *   name: string,
 *   image: string url to avatar image,
}
 * @returns Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }>
 */
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

/**
 * Update user data. Validate if user authorized
 * @param values {
 *   id: number,
 *   email: email format,
 *   password: string min 6, max 20 characters
 *   name: string,
 *   image: string url to avatar image,
}
 * @returns Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }>
 */
export const updateUser = async (
  values: z.infer<typeof UpdateUserSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = UpdateUserSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { id, email } = validatedFields.data;

  const authUser: AuthUser = await getAuthUser();
  if (id != parseInt(authUser.id as string) && authUser.role != "ADMIN")
    return { error: "You have no permission to update someone's user info", code: 401 };

  if (email && authUser?.email != email && (await dbGetUserByEmail(email))) return { error: "Email already in use!", code: 403 };

  const { user, db_error } = await dbUpdateUser(validatedFields.data);

  if (user) return { success: "Successfully updated user!", user, code: 201 };
  else return { error: "Failed to update user", db_error, code: 500 };
};

/**
 * Update password for user by id. Can be perform by user by matching old password. \
 * ADMIN user can update password without providing old password. Validate id user authorized
 * @param values {
 *    id: number,
 *    oldPassword: string | null
 *    newPassword: string
 * }
 * @returns Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }>
 */
export const updatePassword = async (
  values: z.infer<typeof UpdatePasswordSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = UpdatePasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { id, oldPassword, newPassword } = validatedFields.data;

  const authUser: AuthUser = await getAuthUser();
  const isAdmin: boolean = authUser.role != "ADMIN";

  if (id != parseInt(authUser?.id as string) && !isAdmin) return { error: "You have no permission to update someone's password", code: 401 };

  let dbUser = await dbGetUserById(id);

  if (!dbUser) return { error: `No user found by id: '${id}'`, code: 404 };

  if (!isAdmin) {
    if (!oldPassword) return { error: "oldPassword is required.", code: 401 };
    const passwordMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!passwordMatch) return { error: "Old password doesn't match!", code: 401 };
  }

  const { user, db_error } = await dbUpdatePassword({
    id,
    password: await bcrypt.hash(newPassword, 10),
  });

  if (user) return { success: "Successfully updated password!", user, code: 201 };
  else return { error: "Failed to update password!", db_error, code: 500 };
};
