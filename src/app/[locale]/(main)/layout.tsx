// app/(main)/layout.tsx
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "sonner";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import AuthModal from "@/components/auth/AuthModal";

interface LocaleLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LocaleLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Toaster /> {/* Toaster kwa ajili ya notisi */}
            <Footer />
                        <AuthModal /> {/* <<<--- IWEKE HAPA (kawaida mwishoni) */}

                        <OnboardingModal /> {/* <<<--- WEKA HAPA */}

        </div>
    );
}