
import Link from "next/link";
import { Hammer } from "lucide-react";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4 flex items-center space-x-2">
            <Hammer className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">Woodify</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground mt-4">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
