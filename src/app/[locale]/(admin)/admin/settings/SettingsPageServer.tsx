// src/app/[locale]/(admin)/admin/settings/SettingsPageServer.tsx
import { prisma } from "@/lib/prisma";
import SettingsTabsClient from "./SettingsTabsClient"; // Hakikisha path ni sahihi
import { type Translation } from "@prisma/client";

// 'Type' kwa ajili ya tafsiri zilizopangwa
type GroupedTranslations = Record<string, Translation[]>;

async function getSettingsData() {
    // Tumia Promise.all kupata data yote kwa pamoja kwa ufanisi
    const [
        gateways, 
        homepageSettings, 
        contactSettings, 
        allDbTranslations
    ] = await Promise.all([
        prisma.paymentGateway.findMany({ orderBy: { name: 'asc' } }),
        prisma.setting.findUnique({ where: { id: 'page.home' } }),
        prisma.setting.findUnique({ where: { id: 'page.contact' } }),
        prisma.translation.findMany({ orderBy: [{ key: 'asc' }] }),
    ]);

    // Panga tafsiri kwa namespace
    const allTranslations = allDbTranslations.reduce((acc, t) => {
        const namespace = t.key.split('.')[0];
        if (!acc[namespace]) {
            acc[namespace] = [];
        }
        acc[namespace].push(t);
        return acc;
    }, {} as GroupedTranslations); // Tumia 'type' yetu hapa

    return { gateways, homepageSettings, contactSettings, allTranslations };
}

export default async function SettingsPageServer() {
    // Pata data yote kutoka kwenye function yetu moja
    const { gateways, homepageSettings, contactSettings, allTranslations } = await getSettingsData();

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header inaweza kuwa hapa au ndani ya SettingsTabsClient */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage all website content, translations, and payment integrations in one place.
                </p>
            </div>
            
            {/* Pitisha props sahihi zinazoendana na SettingsTabsClient */}
            <SettingsTabsClient
                gateways={gateways}
                contactSettings={contactSettings}
                homepageSettings={homepageSettings}
                allTranslations={allTranslations}
            />
        </div>
    );
}