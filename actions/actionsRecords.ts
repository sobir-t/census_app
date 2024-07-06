"use server";

import { z } from "zod";
import { dbGetUserById, dbUpdateUser } from "@/data/dbUsers";
import { dbGetAddressById, dbSaveAddress, dbUpdateAddress } from "@/data/dbRecords";
import { Address } from "@prisma/client";
import { AddressSchema, UpdateAddressSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "next-auth";

export const getAddressByUserId = async (id: number): Promise<{ success?: string; address?: Address; error?: string; db_error?: string }> => {
  const user = await dbGetUserById(id);
  if (!user) return { error: `User by id '${id}' doesn't exist.` };

  if (!user.addressId) return { error: `User by id '${id}' doesn't have any address saved.` };

  const { address, db_error } = await dbGetAddressById(user.addressId);

  if (db_error) return { error: `Failed to get address by user id '${id}'.`, db_error };

  if (!address) return { error: `No address found for user by id '${id}'.` };

  return { success: `Address found for user by id '${id}'`, address };
};

export const saveAddress = async (values: z.infer<typeof AddressSchema>) => {
  const validatedFields = AddressSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { userId, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;

  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's address." };

  let dbUser = await dbGetUserById(userId);

  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'` };

  const { address, db_error } = await dbSaveAddress({
    address1,
    address2,
    city,
    state,
    zip,
  });

  if (db_error || !address) return { error: "Failed to save address .", db_error };

  const result = await dbUpdateUser({ id: userId, addressId: address.id });

  if (result.db_error) return { error: `Couldn't assign user by id: '${userId}' to address by addressId '${address.id}'.` };

  return { success: "Address saved successfully.", address };
};

export const updateAddress = async (values: z.infer<typeof UpdateAddressSchema>) => {
  const validatedFields = UpdateAddressSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { userId, id, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;

  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's address." };

  const dbUser = await dbGetUserById(userId);

  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'` };

  if (!dbUser.addressId) return { error: `User by id '${id}' doesn't have any address saved.` };

  if (dbUser.addressId != id && currentUser.role != "ADMIN") return { error: "You have no permission to update someone's address." };

  const { address, db_error } = await dbUpdateAddress({
    id,
    address1,
    address2,
    city,
    state,
    zip,
  });

  if (db_error || !address) return { error: "Failed to update address .", db_error };

  return { success: "Address saved successfully.", address };
};
