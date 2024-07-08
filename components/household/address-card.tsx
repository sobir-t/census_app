"use client";

import { getHouseholdByUserId, getLienholderById } from "@/actions/actionsHousehold";
import { Household, Lienholder } from "@prisma/client";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import UpdateAddressDialog from "./update-address-dialog";
// import { FormError } from "../form-error";
// import { FormSuccess } from "../form-success";

interface AddressCardProps {
  user: User;
}

export default function AddressCard({ user }: AddressCardProps) {
  const [isLoading, setLoading] = useState(true);
  const [household, setHousehold] = useState<Household | undefined>(undefined);
  const [lienholder, setLienholder] = useState<Lienholder | undefined>(undefined);
  const [isEditHouseholdOpen, setEditHouseholdOpen] = useState(false);

  const getHousehold = () => {
    setLoading(true);
    getHouseholdByUserId(parseInt(user.id as string)).then((data) => {
      setHousehold(data.household);
      if (data.household?.lienholderId)
        getLienholderById(data.household.lienholderId)
          .then((data) => {
            if (data.lienholder) setLienholder(data.lienholder);
          })
          .finally(() => {
            setLoading(false);
          });
      else setLoading(false);
    });
  };

  useEffect(() => {
    if (!isEditHouseholdOpen) getHousehold();
  }, [isEditHouseholdOpen]);

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:col-span-6 lg:float-start">
        <div className="address-card p-4 flex flex-col border-b-2 rounded-md shadow hover:bg-slate-100">
          <div className="flex justify-between items-center w-full">
            <p>Household information:</p>
            {!isLoading ? <UpdateAddressDialog user={user} household={household} setEditHouseholdOpen={setEditHouseholdOpen} /> : null}
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : household ? (
            <div className="flex flex-col pt-1">
              <div className="w-full flex flex-initial space-x-2">
                <p>
                  <b>Type:</b> {household.homeType}
                </p>
                <p>
                  <b>Ownership:</b> {household.ownership}
                </p>
              </div>
              {lienholder ? (
                <p>
                  <b>Lienholder:</b> {lienholder.name}
                </p>
              ) : null}
              <p>{household.address1}</p>
              {household.address2 ? <p>{household.address2}</p> : null}
              <p>{`${household.city}, ${household.state} ${household.zip}`}</p>
            </div>
          ) : (
            <div className="flex flex-col pt-1">
              <p>You haven't entered your household yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
