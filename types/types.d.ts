import { UserRole } from "@prisma/client";
import { User } from "next-auth";

export interface AuthUser extends User {
  role: UserRole;
}
