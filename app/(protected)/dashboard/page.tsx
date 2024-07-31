// /dashboards

"use client";

import HouseholdCard from "@/components/household/household-card";
import LoadingCard from "@/components/household/loading-card";
import { AuthUser } from "@/types/types";
import { useSession } from "next-auth/react";

export default function LandingPage() {
  let { data } = useSession();
  const user: AuthUser | undefined = data?.user ? (data.user as AuthUser) : undefined;

  return <div className="dashboard-container w-full ">{user ? <HouseholdCard user={user} /> : <LoadingCard className="loading-address-card" />}</div>;
}
