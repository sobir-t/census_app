import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch {
    return null;
  }
};

export const saveNewUser = async ({ name, email, password }: { name: string; email: string; password: string }) => {
  try {
    const user = await db.user.create({
      data: {
        name,
        email,
        password,
      },
    });
    return { user };
  } catch (e: any) {
    return { db_error: e.message };
  }
};
