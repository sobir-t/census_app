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

const getRandomProfileImage = () => {
  const r: number = Math.floor(Math.random() * 13);
  return `/images/${r}.avif`;
};

export const saveNewUser = async ({
  name,
  email,
  password,
  image = getRandomProfileImage(),
}: {
  name: string;
  email: string;
  password: string;
  image?: string;
}) => {
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
