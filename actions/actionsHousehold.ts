"use server";

import { z } from "zod";
import { dbGetUserById, dbUpdateUser } from "@/data/dbUsers";
import {
  dbGetAllLienholders,
  dbGetHouseholdById,
  dbGetLienholderById,
  dbGetLienholderByName,
  dbSaveHousehold,
  dbSaveLienholder,
  dbUpdateHousehold,
  dbUpdateLienholder,
} from "@/data/dbHousehold";
import { Household, Lienholder } from "@prisma/client";
import { HouseholdSchema, UpdateHouseholdSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "next-auth";

export const getHouseholdByUserId = async (id: number): Promise<{ success?: string; household?: Household; error?: string; db_error?: string }> => {
  const user = await dbGetUserById(id);
  if (!user) return { error: `User by id '${id}' doesn't exist.` };
  if (!user.householdId) return { error: `User by id '${id}' doesn't have any household saved.` };

  const { household: address, db_error } = await dbGetHouseholdById(user.householdId);
  if (db_error) return { error: `Failed to get household for user by id '${id}'.`, db_error };
  if (!address) return { error: `No household found for user by id '${id}'.` };
  return { success: `Household found for user by id '${id}'`, household: address };
};

export const saveHousehold = async (
  values: z.infer<typeof HouseholdSchema>
): Promise<{ success?: string; household?: Household; error?: string; db_error?: string; data?: any }> => {
  const validatedFields = HouseholdSchema.safeParse(values);
  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { homeType, ownership, lienholderId, userId, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;
  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's household." };

  let dbUser = await dbGetUserById(userId);
  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'` };

  const { household, db_error } = await dbSaveHousehold({
    homeType,
    ownership,
    lienholderId,
    address1,
    address2,
    city,
    state,
    zip,
  });
  if (db_error || !household) return { error: "Failed to save household.", db_error };

  const result = await dbUpdateUser({ id: userId, householdId: household.id });
  if (result.db_error) return { error: `Couldn't assign user by id: '${userId}' to household by householdId '${household.id}'.` };
  return { success: "Household saved successfully.", household };
};

export const updateHousehold = async (
  values: z.infer<typeof UpdateHouseholdSchema>
): Promise<{ success?: string; household?: Household; error?: string; db_error?: string; data?: any }> => {
  const validatedFields = UpdateHouseholdSchema.safeParse(values);
  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors };

  const { homeType, ownership, lienholderId, userId, id, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;
  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's household." };

  const dbUser = await dbGetUserById(userId);
  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'` };
  if (!dbUser.householdId) return { error: `User by id '${id}' doesn't have any household saved.` };
  if (dbUser.householdId != id && currentUser.role != "ADMIN") return { error: "You have no permission to update someone's household." };

  const { household, db_error } = await dbUpdateHousehold({
    homeType,
    ownership,
    lienholderId,
    id,
    address1,
    address2,
    city,
    state,
    zip,
  });
  if (db_error || !household) return { error: "Failed to update household.", db_error };
  return { success: "Household saved successfully.", household };
};

export const getAllLienholders = async (): Promise<{
  success?: string;
  lienholders?: Lienholder[];
  error?: string;
  db_error?: string;
  data?: any;
}> => {
  const { lienholders, db_error } = await dbGetAllLienholders();
  if (!lienholders?.length || db_error) return { error: "No lienholders found.", db_error };
  return { success: "Lienholders found.", lienholders };
};

export const saveLienholder = async (
  name: string
): Promise<{
  success?: string;
  lienholder?: Lienholder;
  error?: string;
  db_error?: string;
}> => {
  if (!name.length) return { error: "Lienholder name required." };
  const exist = await dbGetLienholderByName(name);
  if (exist.lienholder) return { error: `Lienholder by name '${name}" already exist.`, lienholder: exist.lienholder };
  const { lienholder, db_error } = await dbSaveLienholder(name);
  if (!lienholder || db_error) return { error: "Failed to save lienholders.", db_error };
  return { success: "Successfully saved lienholder.", lienholder };
};

export const updateLienholder = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}): Promise<{
  success?: string;
  lienholder?: Lienholder;
  error?: string;
  db_error?: string;
}> => {
  if (!name.length) return { error: "Lienholder name required." };
  const exist = await dbGetLienholderByName(name);
  if (exist.lienholder) return { error: `Lienholder by name '${name}" already exist.`, lienholder: exist.lienholder };
  const { lienholder, db_error } = await dbUpdateLienholder({ id, name });
  if (!lienholder || db_error) return { error: "Failed to update lienholders.", db_error };
  return { success: "Successfully updated lienholder.", lienholder };
};

export const getLienholderById = async (
  id: number
): Promise<{
  success?: string;
  lienholder?: Lienholder;
  error?: string;
  db_error?: string;
}> => {
  const { lienholder, db_error } = await dbGetLienholderById(id);
  if (!lienholder || db_error) return { error: `Failed to find lienholder by id '${id}'.`, db_error };
  return { success: "Successfully found lienholder.", lienholder };
};
