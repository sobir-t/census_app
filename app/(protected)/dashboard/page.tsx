// /dashboards

"use client";

// export const dynamic = "force-dynamic";

import AddressCard from "@/components/records/address-card";
import LoadingCard from "@/components/records/loading-card";
import { User } from "next-auth";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  let { data } = useSession();

  const user: User | undefined = data?.user;

  return (
    <div className="dashboard-container w-full grid sm:grid-cols-12 gap-4">
      {user ? <AddressCard user={user} /> : <LoadingCard className="loading-address-card" />}
    </div>
  );
}
