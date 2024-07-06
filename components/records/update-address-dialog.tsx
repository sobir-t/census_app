"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Dispatch, SetStateAction } from "react";
import { User } from "next-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema, STATES } from "@/schemas";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { Button } from "../ui/button";
import { Address } from "@prisma/client";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { saveAddress, updateAddress } from "@/actions/actionsRecords";

interface UpdateAddressDialogProps {
  isEditAddressOpen: boolean;
  setEditAddressOpen: Dispatch<SetStateAction<boolean>>;
  address: Address | undefined;
  user: User;
}

export default function UpdateAddressDialog({ user, address, isEditAddressOpen, setEditAddressOpen }: UpdateAddressDialogProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      userId: parseInt(user.id as string),
      address1: address?.address1,
      address2: address?.address2 || undefined,
      city: address?.city,
      state: address?.state,
      zip: address?.zip,
    },
  });

  const onSubmit = (values: z.infer<typeof AddressSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      console.log("values:");
      console.log(values);
      if (!address)
        saveAddress(values).then((data) => {
          if (data.error) setError(data.error);
          else {
            setSuccess(data.success);
            setEditAddressOpen(false);
          }
        });
      else
        updateAddress({ id: address.id, ...values }).then((data) => {
          if (data.error) setError(data.error);
          else {
            setSuccess(data.success);
            setEditAddressOpen(false);
          }
        });
    });
  };
  return (
    <Dialog open={isEditAddressOpen} onClose={() => setEditAddressOpen(false)} className="relative z-50 ">
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-slate-600 bg-opacity-50 ">
        <DialogPanel className="w-96 border bg-white p-5">
          <DialogTitle className="font-bold">Update your address</DialogTitle>
          <Form {...form}>
            <form name="register-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4 grid grid-cols-12 gap-2">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Address line 1</FormLabel>
                      <FormControl>
                        <Input id="address1" {...field} disabled={isPending} placeholder="Street address"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Address line 2</FormLabel>
                      <FormControl>
                        <Input id="address2" {...field} disabled={isPending} placeholder="Apartment, Suite, Floor"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input id="city" {...field} disabled={isPending} placeholder="City, Town, Borrow"></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem id="state" className="col-span-3">
                      <FormLabel>State</FormLabel>
                      <Select {...field} disabled={isPending} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={address?.state ? address.state : "Select State"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Zip code</FormLabel>
                      <FormControl>
                        <Input id="zip" {...field} disabled={isPending}></Input>
                      </FormControl>
                      <FormMessage></FormMessage>
                    </FormItem>
                  )}
                ></FormField>
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <div className="w-full flex justify-between col-span-12">
                <Button
                  variant="outline"
                  name="cancel-password-update-button btn"
                  type="reset"
                  className="w-full flex mr-5"
                  disabled={isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    form.reset();
                    setEditAddressOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="secondary" name="password-update-button btn" type="submit" className="w-full flex ml-5" disabled={isPending}>
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
