// /profile

"use client";

import { getAuthUser } from "@/actions/actionsAuth";
// import { auth } from "@/auth";
import { ProfileForm } from "@/components/auth/profile-form";
import PageHeader from "@/components/page-title";
import { AuthUser } from "@/types/types";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getAuthUser().then((data) => {
      setAuthUser(data);
    });
  }, []);
  return (
    <>
      <PageHeader title="Profile" />
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{authUser ? <ProfileForm authUser={authUser} /> : <p>Loading . . .</p>}</div>
      </main>
    </>
  );
}
