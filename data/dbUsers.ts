import { db } from "@/lib/db";
import { User } from "@prisma/client";

export const dbGetUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const dbGetUserById = async (id: number): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const dbSaveNewUser = async ({
  name,
  email,
  password,
  image,
}: {
  name: string;
  email: string;
  password: string;
  image: string;
}): Promise<{ user?: User; db_error?: string }> => {
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        password,
        image,
      },
    });
    return { user };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbUpdateUser = async ({
  id,
  name,
  email,
  image,
  addressId,
}: {
  id: number;
  name?: string;
  email?: string;
  image?: string;
  addressId?: number;
}): Promise<{ user?: User; db_error?: string }> => {
  try {
    const user = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        image,
        addressId,
      },
    });
    return { user };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbUpdatePassword = async ({ id, password }: { id: number; password: string }): Promise<{ user?: User; db_error?: string }> => {
  try {
    const user = await db.user.update({
      where: { id },
      data: {
        password,
      },
    });
    return { user };
  } catch (e: any) {
    return { db_error: e.message };
  }
};
