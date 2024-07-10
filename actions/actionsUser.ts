"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { dbGetUserByEmail, dbGetUserById, dbUpdatePassword, dbUpdateUser } from "@/data/dbUsers";
import { UpdatePasswordSchema, UpdateUserSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "@prisma/client";

export const updateUser = async (
  values: z.infer<typeof UpdateUserSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = UpdateUserSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { id, email, name, image, role, householdId } = validatedFields.data;

  const currentUser = (await auth())?.user;

  if (email && currentUser?.email != email && (await dbGetUserByEmail(email))) return { error: "Email already in use!", code: 403 };

  const { user, db_error } = await dbUpdateUser({
    id,
    name,
    email,
    image,
    role,
    householdId,
  });

  if (user) return { success: "Successfully updated user!", user, code: 201 };
  else return { error: "Failed to update user", db_error, code: 500 };
};

export const updatePassword = async (
  values: z.infer<typeof UpdatePasswordSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = UpdatePasswordSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { id, oldPassword, newPassword } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;

  if (id != currentUser?.id && currentUser.role != "ADMIN") return { error: "You have no permission to update someone's password", code: 401 };

  let dbUser = await dbGetUserById(id);

  if (!dbUser) return { error: `Couldn't query for user by id: '${id}'`, code: 404 };

  const passwordMatch = await bcrypt.compare(oldPassword, dbUser.password);

  if (!passwordMatch) return { error: "Old password doesn't match!", code: 401 };

  const { user, db_error } = await dbUpdatePassword({
    id,
    password: await bcrypt.hash(newPassword, 10),
  });

  if (user) return { success: "Successfully updated password!", user, code: 201 };
  else return { error: "Failed to update password!", db_error, code: 500 };
};
