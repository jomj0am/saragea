import { setRequestLocale } from "next-intl/server";
import LoginForm from "../LoginForm"; // We will use the existing form but enhance it
import Link from "next/link";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // const t = await getTranslations("Auth");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">
          Please enter your details to sign in.
        </p>
      </header>

      <LoginForm />

      <footer className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-primary hover:underline"
        >
          Create one for free
        </Link>
      </footer>
    </div>
  );
}
