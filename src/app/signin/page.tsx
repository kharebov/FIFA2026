import Link from "next/link";
import { CredentialsForm } from "./credentials-form";
import { signInWithGoogle } from "./actions";
import { buttonClasses } from "@/components/button";

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>

      <form action={signInWithGoogle}>
        <button type="submit" className={buttonClasses("secondary", "w-full gap-2")}>
          <GoogleIcon className="h-4 w-4" />
          Войти через Google
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        или по email
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <CredentialsForm />

      <p className="text-sm text-zinc-500">
        Ещё нет аккаунта?{" "}
        <Link href="/signup" className="underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.75l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.87 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
