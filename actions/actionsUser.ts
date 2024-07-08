"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { dbGetUserByEmail, dbGetUserById, dbUpdatePassword, dbUpdateUser } from "@/data/dbUsers";
import { UpdatePasswordSchema, UpdateUserSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "@prisma/client";

export const updateUser = async (
  values: z.infer<typeof UpdateUserSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string }> => {
  const validatedFields = UpdateUserSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { id, email, name, image, role, householdId } = validatedFields.data;

  const currentUser = (await auth())?.user;

  if (email && currentUser?.email != email && (await dbGetUserByEmail(email))) return { error: "Email already in use!" };

  const { user, db_error } = await dbUpdateUser({
    id,
    name,
    email,
    image,
    role,
    householdId,
  });

  if (user) return { success: "Successfully updated user!", user };
  else return { error: "Failed to update user", db_error };
};

export const updatePassword = async (
  values: z.infer<typeof UpdatePasswordSchema>
): Promise<{ success?: string; user?: User; error?: string; data?: any; db_error?: string }> => {
  const validatedFields = UpdatePasswordSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { id, oldPassword, newPassword } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;

  if (id != currentUser?.id && currentUser.role != "ADMIN") return { error: "You have no permission to update someone's password" };

  let dbUser = await dbGetUserById(id);

  if (!dbUser) return { error: `Couldn't query for user by id: '${id}'` };

  const passwordMatch = await bcrypt.compare(oldPassword, dbUser.password);

  if (!passwordMatch) return { error: "Old password doesn't match!" };

  const { user, db_error } = await dbUpdatePassword({
    id,
    password: await bcrypt.hash(newPassword, 10),
  });

  if (user) return { success: "Successfully updated password!", user };
  else return { error: "Failed to update password!", db_error };
};
