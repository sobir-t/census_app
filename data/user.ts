import { db } from "@/lib/db";

export const dbGetUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const dbGetUserById = async (id: number) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const dbSaveNewUser = async ({ name, email, password, image }: { name: string; email: string; password: string; image: string }) => {
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

export const dbUpdateUser = async ({ id, name, email, image }: { id: number; name?: string; email?: string; image?: string }) => {
  try {
    const user = await db.user.update({
      where: { id },
      data: {
        name,
        email,
        image,
      },
    });
    return { user };
  } catch (e: any) {
    return { db_error: e.message };
  }
};

export const dbUpdatePassword = async ({ id, password }: { id: number; password: string }) => {
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
