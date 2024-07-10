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

export const getHouseholdByUserId = async (
  id: number
): Promise<{ success?: string; household?: Household; error?: string; db_error?: string; code: number }> => {
  const user = await dbGetUserById(id);
  if (!user) return { error: `User by id '${id}' doesn't exist.`, code: 404 };
  if (!user.householdId) return { error: `User by id '${id}' doesn't have any household saved.`, code: 404 };

  const { household, db_error } = await dbGetHouseholdById(user.householdId);
  if (db_error) return { error: `Failed to get household for user by id '${id}'.`, db_error, code: 500 };
  if (!household) return { error: `No household found for user by id '${id}'.`, code: 404 };
  return { success: `Household found for user by id '${id}'`, household, code: 200 };
};

export const saveHousehold = async (
  values: z.infer<typeof HouseholdSchema>
): Promise<{ success?: string; household?: Household; error?: string; db_error?: string; data?: any; code: number }> => {
  const validatedFields = HouseholdSchema.safeParse(values);
  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { homeType, ownership, lienholderId, userId, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;
  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's household.", code: 403 };

  let dbUser = await dbGetUserById(userId);
  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'`, code: 404 };

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
  if (db_error || !household) return { error: "Failed to save household.", db_error, code: 500 };

  const result = await dbUpdateUser({ id: userId, householdId: household.id });
  if (result.db_error) return { error: `Couldn't assign user by id: '${userId}' to household by householdId '${household.id}'.`, code: 500 };
  return { success: "Household saved successfully.", household, code: 201 };
};

export const updateHousehold = async (
  values: z.infer<typeof UpdateHouseholdSchema>
): Promise<{ success?: string; household?: Household; error?: string; db_error?: string; data?: any; code: number }> => {
  const validatedFields = UpdateHouseholdSchema.safeParse(values);
  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));
  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { homeType, ownership, lienholderId, userId, id, address1, address2, city, state, zip } = validatedFields.data;

  const currentUser = (await auth())?.user as unknown as User;
  if (userId != parseInt(currentUser?.id as string) && currentUser.role != "ADMIN")
    return { error: "You have no permission to update someone's household.", code: 401 };

  const dbUser = await dbGetUserById(userId);
  if (!dbUser) return { error: `Couldn't find user by id: '${userId}'` };
  if (!dbUser.householdId) return { error: `User by id '${id}' doesn't have any household saved.`, code: 404 };
  if (dbUser.householdId != id && currentUser.role != "ADMIN") return { error: "You have no permission to update someone's household.", code: 401 };

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
  if (db_error || !household) return { error: "Failed to update household.", db_error, code: 500 };
  return { success: "Household saved successfully.", household, code: 201 };
};

export const getAllLienholders = async (): Promise<{
  success?: string;
  lienholders?: Lienholder[];
  error?: string;
  db_error?: string;
  data?: any;
  code: number;
}> => {
  const { lienholders, db_error } = await dbGetAllLienholders();
  if (!lienholders?.length || db_error) return { error: "No lienholders found.", db_error, code: 404 };
  return { success: "Lienholders found.", lienholders, code: 200 };
};

export const saveLienholder = async (
  name: string
): Promise<{
  success?: string;
  lienholder?: Lienholder;
  error?: string;
  db_error?: string;
  code: number;
}> => {
  if (!name.length) return { error: "Lienholder name required.", code: 403 };
  const exist = await dbGetLienholderByName(name);
  if (exist.lienholder) return { error: `Lienholder by name '${name}" already exist.`, lienholder: exist.lienholder, code: 403 };
  const { lienholder, db_error } = await dbSaveLienholder(name);
  if (!lienholder || db_error) return { error: "Failed to save lienholders.", db_error, code: 500 };
  return { success: "Successfully saved lienholder.", lienholder, code: 201 };
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
  code: number;
}> => {
  if (!name.length) return { error: "Lienholder name required.", code: 403 };
  const exist = await dbGetLienholderByName(name);
  if (exist.lienholder) return { error: `Lienholder by name '${name}" already exist.`, lienholder: exist.lienholder, code: 403 };
  const { lienholder, db_error } = await dbUpdateLienholder({ id, name });
  if (!lienholder || db_error) return { error: "Failed to update lienholders.", db_error, code: 500 };
  return { success: "Successfully updated lienholder.", lienholder, code: 201 };
};

export const getLienholderById = async (
  id: number
): Promise<{
  success?: string;
  lienholder?: Lienholder;
  error?: string;
  db_error?: string;
  code: number;
}> => {
  const { lienholder, db_error } = await dbGetLienholderById(id);
  if (db_error) return { error: `Failed to find lienholder by id '${id}'.`, db_error, code: 500 };
  if (!lienholder) return { error: `No lienholder found by id '${id}'.`, db_error, code: 404 };
  return { success: "Successfully found lienholder.", lienholder, code: 200 };
};
