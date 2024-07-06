// /profile

"use client";

// import { auth } from "@/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import { User } from "next-auth";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data } = useSession();
  const user = data?.user;
  return (
    <>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{user ? <ProfileForm user={user as User} /> : <p>Loading . . .</p>}</div>
      </main>
    </>
  );
}
