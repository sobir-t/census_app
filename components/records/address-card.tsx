"use client";

import { getAddressByUserId } from "@/actions/actionsRecords";
import { Address } from "@prisma/client";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import UpdateAddressDialog from "./update-address-dialog";
// import { FormError } from "../form-error";
// import { FormSuccess } from "../form-success";

interface AddressCardProps {
  user: User;
}

export default function AddressCard({ user }: AddressCardProps) {
  const [isLoading, setLoading] = useState(true);
  const [address, setAddress] = useState<Address | undefined>(undefined);
  const [isEditAddressOpen, setEditAddressOpen] = useState(false);

  const getAddress = async () => {
    setLoading(true);
    getAddressByUserId(parseInt(user.id as string)).then((data) => {
      setAddress(data.address);
      setLoading(false);
    });
  };

  useEffect(() => {
    getAddress();
  }, [isEditAddressOpen]);

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:col-span-6 lg:float-start">
        <div className="address-card p-4 flex flex-col border-b-2 rounded-md shadow hover:bg-slate-100">
          <div className="flex justify-between items-center w-full">
            <p>Household address:</p>
            <Button
              disabled={isLoading}
              variant="link"
              name="edit-address-button btn"
              type="button"
              onClick={() => {
                setEditAddressOpen(true);
              }}
            >
              {address ? "Edit address" : "Add address"}
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-52" />
            </div>
          ) : address ? (
            <div className="flex flex-col pt-1">
              <p>{address.address1}</p>
              {address.address2 ? <p>{address.address2}</p> : null}
              <p>{`${address.city}, ${address.state} ${address.zip}`}</p>
            </div>
          ) : (
            <div className="flex flex-col pt-1">
              <p>You haven't entered your address yet</p>
            </div>
          )}
        </div>
      </div>
      <UpdateAddressDialog user={user} address={address} isEditAddressOpen={isEditAddressOpen} setEditAddressOpen={setEditAddressOpen} />
    </>
  );
}
