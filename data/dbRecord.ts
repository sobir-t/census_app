import { db } from "@/lib/db";
import { Record } from "@prisma/client";

export const dbGetAllRecords = async (): Promise<{ records?: Record[]; db_error?: string }> => {
  try {
    const records: Record[] = await db.record.findMany();
    return { records };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbGetRecordById = async (id: number): Promise<{ record?: Record | null; db_error?: string }> => {
  try {
    const record: Record | null = await db.record.findUnique({
      where: { id },
    });
    return { record };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbGetRecordsUnderHouseholdId = async (householdId: number): Promise<{ records?: Record[]; db_error?: string }> => {
  try {
    const records: Record[] = await db.record.findMany({
      where: { householdId },
    });
    return { records };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbSaveRecord = async (newRecord: Omit<Record, "id">): Promise<{ record?: Record; db_error?: string }> => {
  try {
    const record: Record = await db.record.create({
      data: { ...newRecord },
    });
    return { record };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbUpdateRecord = async (newRecord: Record): Promise<{ record?: Record; db_error?: string }> => {
  try {
    const record: Record = await db.record.update({
      where: { id: newRecord.id },
      data: { ...newRecord },
    });
    return { record };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbDeleteRecordById = async (id: number): Promise<{ record?: Record; db_error?: string }> => {
  try {
    const record: Record = await db.record.delete({
      where: { id },
    });
    return { record };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbDeleteRecordsUnderHouseholdId = async (householdId: number): Promise<{ db_error?: string }> => {
  try {
    const record = await db.record.deleteMany({
      where: { householdId },
    });
    console.log(record);
    return {};
  } catch (e: any) {
    return { db_error: e.message };
  }
};
