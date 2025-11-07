'use client';

import { useState } from "react";
import GatewaySettingsForm from "@/components/admin/settings/GatewaySettingsForm";
import AboutPageEditor from "@/components/admin/settings/AboutPageEditor";
import ContactPageEditor from "@/components/admin/settings/ContactPageEditor";
import HomepageEditor from "@/components/admin/settings/HomepageEditor";
import TranslationEditor from "@/components/admin/settings/TranslationEditor";
import { Toaster } from "@/components/ui/sonner";
import { CreditCard, Globe, Home, Info, Mail } from "lucide-react";
import clsx from "clsx";
import { type PaymentGateway, type Setting, type Translation } from '@prisma/client';

type GroupedTranslations = Record<string, Translation[]>;

interface SettingsTabsClientProps {
    gateways: PaymentGateway[];
    contactSettings: Setting | null;
    homepageSettings: Setting | null;
    allTranslations: GroupedTranslations;
}

export default function SettingsTabsClient({
    gateways,
    contactSettings,
    homepageSettings,
    allTranslations,
}: SettingsTabsClientProps) {

    const [activeTab, setActiveTab] = useState("payments");

    const renderTabContent = () => {
        switch (activeTab) {
            case "payments":
                return (
                    <div className="space-y-6">
                        {gateways.map((gateway) => (
                            <GatewaySettingsForm key={gateway.id} gateway={gateway} />
                        ))}
                    </div>
                );
            case "translations":
                return <TranslationEditor initialTranslations={allTranslations} />;
            case "homepage":
                return (
                    <HomepageEditor
                        initialSettings={homepageSettings}
                    />
                );
            case "about":
                const aboutPageTranslations = allTranslations['AboutPage'] || [];
                return <AboutPageEditor initialTranslations={aboutPageTranslations} />;
            case "contact":
                return <ContactPageEditor initialSettings={contactSettings} />;
            default:
                return null;
        }
    };

    const tabs = [
        { key: "payments", label: "Payment Gateways", icon: CreditCard, color: "from-purple-400/80 to-pink-500/80" },
        { key: "translations", label: "Translations", icon: Globe, color: "from-blue-400/70 to-cyan-500/70" },
        { key: "homepage", label: "Home Page", icon: Home, color: "from-green-400/70 to-lime-500/70" },
        { key: "about", label: "About Page", icon: Info, color: "from-orange-400/70 to-red-500/70" },
        { key: "contact", label: "Contact Page", icon: Mail, color: "from-indigo-400/70 to-purple-500/70" },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6 md:p-10 min-h-screen ">

            {/* Sticky Sidebar */}
            <aside className="flex-shrink-0 w-full md:w-68  rounded-xl   md:p- space-y-4 sticky top-6 h-fit transition-all">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white tracking-wide">Settings</h2>
                <nav className="flex flex-row md:flex-col gap-3 justify-center">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={clsx(
                                    "flex items-center gap-3 p-3 rounded-xl font-medium text-lg transition-all transform shadow-card",
                                    isActive
                                        ? `bg-gradient-to-r ${tab.color} text-white scale-105 shadow-2xl hover:scale-105`
                                        : "bg-slate-100 dark:bg-slate-300/20  text-gray-800 dark:text-gray-200 hover:scale-105 hover:shadow-xl"
                                )}
                            >
                                <Icon
                                    className={clsx(
                                        "w-6 h-6",
                                        isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                                    )}
                                />
                                <span className="hidden md:block text-[16px]  text-muted-foreground">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1  md:shadow-inner  md:p-8 md:space-y-6">
                <Toaster />
                {renderTabContent()}
            </main>
        </div>
    );
}
