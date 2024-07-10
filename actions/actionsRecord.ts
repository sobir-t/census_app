import {
  dbDeleteRecordById,
  dbDeleteRecordsUnderHouseholdId,
  dbGetRecordById,
  dbGetRecordsUnderHouseholdId,
  dbSaveRecord,
  dbUpdateRecord,
} from "@/data/dbRecord";
import { Record } from "@prisma/client";
import { getHouseholdByUserId } from "./actionsHousehold";
import { RecordSchema, UpdateRecordSchema } from "@/schemas";
import { auth } from "@/auth";
import { User } from "next-auth";
import { z } from "zod";
import { checkPermission, getAuthUser } from "./actionsAuth";
import { dbGetUserById, dbGetUsersByRecordId } from "@/data/dbUsers";
import { dbGetHouseholdById } from "@/data/dbHousehold";

export const getRecordsUnderUserId = async (
  id: number
): Promise<{ success?: string; records?: Record[]; error?: string; data?: any; db_error?: string; code: number }> => {
  const currentUser: User | undefined = (await auth())?.user;
  if (id != parseInt(currentUser?.id as string) && currentUser?.role != "ADMIN")
    return { error: "You have no permission to get records under someone's household", code: 401 };

  const result = await getHouseholdByUserId(id);
  if (!result.household) return result;

  const { records, db_error } = await dbGetRecordsUnderHouseholdId(result.household.id);
  if (db_error) return { error: `Failed to get records for user by id '${id}'.`, db_error, code: 500 };
  if (!records || !records.length) return { error: `No records found for user by id '${id}'.`, code: 404 };

  return { success: `Records found for user by id '${id}'`, records, code: 200 };
};

export const saveRecord = async (
  values: z.infer<typeof RecordSchema>
): Promise<{ success?: string; records?: Record[]; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = RecordSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { userId } = validatedFields.data;

  const result = await checkPermission({ userId, errorMessage: "You have no permission to add records to someone's household." });
  if (result.error) return result;

  const result1 = await getHouseholdByUserId(userId);
  if (!result1.household) return result1;

  const { record, db_error } = await dbSaveRecord(validatedFields.data);
  if (!record || db_error) return { error: "Failed to save new record.", db_error, code: 500 };

  return { success: "Successfully saved new record.", code: 201 };
};

export const updateRecord = async (
  values: z.infer<typeof UpdateRecordSchema>
): Promise<{ success?: string; records?: Record[]; error?: string; data?: any; db_error?: string; code: number }> => {
  const validatedFields = UpdateRecordSchema.safeParse(values);

  console.log(JSON.stringify(validatedFields.error?.errors, null, 2));

  if (!validatedFields.success) return { error: "Invalid fields!", data: validatedFields.error?.errors, code: 403 };

  const { id } = validatedFields.data;

  const currentUser = (await auth())?.user;
  const isAdmin: boolean = currentUser?.role == "ADMIN";
  const result1 = await dbGetRecordById(id);
  if (!result1.record || result1.db_error) {
    // if current user is not connected to record and is not ADMIN then we avoiding giving any information
    if (isAdmin) return { error: `Record by id '${id}' doesn't exist.`, db_error: result1.db_error, code: 404 };
    else return { error: "You have no permission to update record under someone's household.", code: 401 };
  }

  const result2 = await dbGetUsersByRecordId(id);
  const userFromRecordsCall = result2.users?.find((p) => p.id == parseInt(currentUser?.id as string));
  if (!userFromRecordsCall && !isAdmin) return { error: "You have no permission to update record under someone's household.", code: 401 };

  // if record in under user's household or user is admin then record is allowed to be updated
  const { record, db_error } = await dbUpdateRecord(validatedFields.data);
  if (!record || db_error) return { error: "Failed to update record.", db_error, code: 500 };

  return { success: "Successfully updated record.", code: 201 };
};

export const deleteRecord = async ({
  id,
}: {
  userId: number;
  id: number;
}): Promise<{ success?: string; records?: Record[]; error?: string; data?: any; db_error?: string; code: number }> => {
  const currentUser = (await auth())?.user;
  const isAdmin: boolean = currentUser?.role == "ADMIN";
  const result1 = await dbGetRecordById(id);
  if (!result1.record || result1.db_error) {
    // if current user is not connected to record and is not ADMIN then we avoiding giving any information
    if (isAdmin) return { error: `Record by id '${id}' doesn't exist.`, db_error: result1.db_error, code: 404 };
    else return { error: "You have no permission to delete record under someone's household.", code: 401 };
  }

  const result2 = await dbGetUsersByRecordId(id);
  const userFromRecordsCall = result2.users?.find((p) => p.id == parseInt(currentUser?.id as string));
  if (!userFromRecordsCall && !isAdmin) return { error: "You have no permission to delete record under someone's household.", code: 401 };

  // if record in under user's household or user is admin then record is allowed to be deleted
  const { record, db_error } = await dbDeleteRecordById(id);
  if (!record || db_error) return { error: "Failed to delete record.", db_error, code: 500 };

  return { success: "Successfully deleted record.", code: 201 };
};

export const deleteRecordsUnderHouseholdId = async (
  id: number
): Promise<{ success?: string; records?: Record[]; error?: string; data?: any; db_error?: string; code: number }> => {
  const currentUser = (await auth())?.user;
  const isAdmin: boolean = currentUser?.role == "ADMIN";

  const result1 = await dbGetHouseholdById(id);
  if (!result1.household) {
    // if current user is not connected to record and is not ADMIN then we avoiding giving any information
    if (isAdmin) return { error: `Household by id '${id}' doesn't exist.`, db_error: result1.db_error, code: 404 };
    else return { error: "You have no permission to delete records under someone's household.", code: 401 };
  }

  const result2 = await dbGetUserById(parseInt(currentUser?.id as string));
  if (result1.household.id != result2?.householdId && !isAdmin)
    return { error: "You have no permission to delete records under someone's household.", code: 401 };

  const { db_error } = await dbDeleteRecordsUnderHouseholdId(id);
  if (db_error) return { error: "Failed to delete records.", db_error, code: 500 };

  return { success: "Successfully deleted records.", code: 201 };
};
