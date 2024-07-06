import { db } from "@/lib/db";
import { Address, State } from "@prisma/client";

export const dbGetAddressById = async (id: number): Promise<{ address?: Address | null; db_error?: string }> => {
  try {
    const address = await db.address.findUnique({
      where: {
        id,
      },
    });
    return { address };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbSaveAddress = async ({
  address1,
  address2,
  city,
  state,
  zip,
}: {
  address1: string;
  address2?: string;
  city: string;
  state: State;
  zip: number;
}): Promise<{ address?: Address; db_error?: string }> => {
  try {
    const address = await db.address.create({
      data: { address1, address2, city, state, zip },
    });
    return { address };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbUpdateAddress = async ({
  id,
  address1,
  address2,
  city,
  state,
  zip,
}: {
  id: number;
  address1: string;
  address2?: string;
  city: string;
  state: State;
  zip: number;
}): Promise<{ address?: Address; db_error?: string }> => {
  try {
    const address = await db.address.update({
      where: { id },
      data: { address1, address2, city, state, zip },
    });
    return { address };
  } catch (e: any) {
    return { db_error: e.message };
  }
};
