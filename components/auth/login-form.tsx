"use client";

import * as z from "zod";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema } from "@/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { login } from "@/actions/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values, DEFAULT_LOGIN_REDIRECT).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <CardWrapper headerLabel="Welcome back!" backButtonLabel="Don't have an account?" backButtonHref="/auth/register">
      <Form {...form}>
        <form className="login-form space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="email-label">Email</FormLabel>
                  <FormControl>
                    <Input {...field} id="email" placeholder="john.doe@example.com" type="email" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="password-label">Password</FormLabel>
                  <FormControl>
                    <Input {...field} id="password" type="password" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" id="login-button" className="login-button btn w-full" disabled={isPending}>
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
    // <div>
    //

    //   <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    //     <form className="space-y-6" action="#" method="POST">
    //       <div>
    //         <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
    //           Email address
    //         </label>
    //         <div className="mt-2">
    //           <input
    //             id="email"
    //             name="email"
    //             type="email"
    //             autoComplete="email"
    //             required
    //             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    //           />
    //         </div>
    //       </div>

    //       <div>
    //         <div className="flex items-center justify-between">
    //           <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
    //             Password
    //           </label>
    //           <div className="text-sm">
    //             <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
    //               Forgot password?
    //             </a>
    //           </div>
    //         </div>
    //         <div className="mt-2">
    //           <input
    //             id="password"
    //             name="password"
    //             type="password"
    //             autoComplete="current-password"
    //             required
    //             className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    //           />
    //         </div>
    //       </div>

    //       <div>
    //         <button
    //           type="submit"
    //           className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    //         >
    //           Sign in
    //         </button>
    //       </div>
    //     </form>

    //     <p className="mt-10 text-center text-sm text-gray-500">
    //       Not a member?{" "}
    //       <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
    //         Start a 14 day free trial
    //       </a>
    //     </p>
    //   </div>
    // </div>
  );
};
