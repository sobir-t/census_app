import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Welcome to Census Registration</h2>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
        <LoginButton>
          <Button variant="default" size="lg" className="mt-10 flex w-full justify-center px-3 py-1.5 leading-6">
            Login
          </Button>
        </LoginButton>
      </div>
    </div>
  );
}
