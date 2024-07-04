// /profile

"use client";

// import { auth } from "@/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import { User } from "next-auth";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data } = useSession();
  const user = data?.user;
  if (user) {
    return <ProfileForm user={user as User} />;
  } else return <p>Something went wrong!</p>;
}
