import { setRequestLocale } from "next-intl/server";
import RegisterForm from "../RegisterForm";
import { Link } from "@/i18n/navigation";

export default async function RegisterPage({
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
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Join the SARAGEA community to find your perfect home.
        </p>
      </header>

      {/* The enhanced form */}
      <RegisterForm />

      <footer className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Sign in here
        </Link>
      </footer>
    </div>
  );
}
