"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { RegisterSchema } from "@/schemas";
import { getUserByEmail, saveNewUser } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
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
