// prisma/seed.ts
import { PrismaClient, GatewayProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * SEED PAYMENT GATEWAYS
 * Creates or updates the default payment gateways.
 */
async function seedPaymentGateways() {
    console.log('Seeding payment gateways...');
    const gateways = [
        { provider: GatewayProvider.SELCOM, name: 'Selcom' },
        { provider: GatewayProvider.PESAPAL, name: 'Pesapal' },
        { provider: GatewayProvider.FLUTTERWAVE, name: 'Flutterwave' },
        { provider: GatewayProvider.PAYCHANGU, name: 'PayChangu' },
    ];

    for (const gateway of gateways) {
        await prisma.paymentGateway.upsert({
            where: { provider: gateway.provider },
            update: {},
            create: { provider: gateway.provider, name: gateway.name },
        });
    }
    console.log('Payment gateways seeded successfully.');
}

/**
 * SEED DEFAULT ADMIN USER
 * Creates a default administrator if one doesn't exist.
 * Uses environment variables for credentials.
 */
async function seedDefaultAdmin() {
    console.log('Seeding default admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                name: 'SARAGEA Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log(`Default admin user created with email: ${adminEmail}`);
    } else {
        console.log('Admin user already exists.');
    }
}

/**
 * SEED TRANSLATIONS
 * Reads JSON translation files from the /messages directory and populates the database.
 */
async function seedTranslations() {
    console.log('Seeding translations...');
    const locales = ['en', 'sw', 'fr'];

    for (const locale of locales) {
        try {
            const filePath = path.join(process.cwd(), `messages/${locale}.json`);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const translations = JSON.parse(fileContent);

            const flattenObject = (obj: any, prefix = '') => {
                return Object.keys(obj).reduce((acc, k) => {
                    const pre = prefix.length ? prefix + '.' : '';
                    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                        Object.assign(acc, flattenObject(obj[k], pre + k));
                    } else {
                        // We will handle arrays in page content seeding. Here we just stringify them if any.
                        acc[pre + k] = obj[k];
                    }
                    return acc;
                }, {} as Record<string, any>);
            };

            const flatTranslations = flattenObject(translations);

            for (const key in flatTranslations) {
                // Skip seeding complex objects like testimonials from here
                if (typeof flatTranslations[key] === 'object') continue;

                await prisma.translation.upsert({
                    where: { locale_key: { locale, key } },
                    update: { value: String(flatTranslations[key]) },
                    create: { locale, key, value: String(flatTranslations[key]) },
                });
            }
            console.log(`Seeded translations for locale: ${locale}`);
        } catch (error) {
            console.error(`Could not seed translations for ${locale}. Make sure 'messages/${locale}.json' exists.`, error);
        }
    }
}

/**
 * SEED PAGE CONTENT AND SETTINGS
 * Creates the default settings and JSON content for dynamic pages like Homepage and About Us.
 */
async function seedPageContent() {
    console.log("Seeding page content settings...");

    const homePageContent = {
        // --- Hero Section ---
        hero: {
            titleKey: 'HomePageV3.heroTitle',
            subtitleKey: 'HomePageV3.heroSubtitle',
            ctaButtonKey: 'HomePageV3.heroCtaButton',
            splineUrl: 'https://prod.spline.design/gFc-yL5gLSpzI6bU/scene.splinecode'
        },
        // --- Testimonials Section ---
        testimonials: [
            {
                name: 'Asha Juma',
                locationKey: 'HomePageV3.testimonial1Location',
                quoteKey: 'HomePageV3.testimonial1Quote',
                avatarUrl: '/avatars/female-1.png'
            },
            {
                name: 'John Bakari',
                locationKey: 'HomePageV3.testimonial2Location',
                quoteKey: 'HomePageV3.testimonial2Quote',
                avatarUrl: '/avatars/male-1.png'
            },
            {
                name: 'Fatima Khamis',
                locationKey: 'HomePageV3.testimonial3Location',
                quoteKey: 'HomePageV3.testimonial3Quote',
                avatarUrl: '/avatars/female-2.png'
            }
        ],
        // --- Why Choose Us Section ---
        features: [
            { titleKey: "HomePageV3.whyChooseUsFeature1Title", descKey: "HomePageV3.whyChooseUsFeature1Desc", lottieFile: "/lottie/security.json" },
            { titleKey: "HomePageV3.whyChooseUsFeature2Title", descKey: "HomePageV3.whyChooseUsFeature2Desc", lottieFile: "/lottie/payment.json" },
            { titleKey: "HomePageV3.whyChooseUsFeature3Title", descKey: "HomePageV3.whyChooseUsFeature3Desc", lottieFile: "/lottie/support.json" }
        ]
    };

    const contactPageContent = {
        contactDetails: {
            titleKey: 'ContactPage.detailsTitle',
            addressKey: 'ContactPage.address',
            phone1Key: 'ContactPage.phone1',
            phone2Key: 'ContactPage.phone2',
            emailKey: 'ContactPage.email',
            // Hizi ni coordinates za ramani
            latitude: -6.776,
            longitude: 39.2369,
        },
        form: {
            titleKey: 'ContactPage.formTitle',
            subtitleKey: 'ContactPage.formSubtitle',
        }
    };

    // Upsert Contact Page Settings
    await prisma.setting.upsert({
        where: { id: 'page.contact' },
        update: {},
        create: {
            id: 'page.contact',
            isEnabled: true,
            jsonContent: contactPageContent as any,
        },
    });

    const aboutPageContent = {
        // --- Hero Section ---
        hero: {
            titleKey: 'AboutPage.heroTitle',
            subtitleKey: 'AboutPage.heroSubtitle',
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80'
        },
        // --- Story Section ---
        story: {
            titleKey: 'AboutPage.storyTitle',
            paragraph1Key: 'AboutPage.storyParagraph1',
            paragraph2Key: 'AboutPage.storyParagraph2',
            imageUrl: 'https://images.unsplash.com/photo-1605276374104-5de67d60924f?q=80'
        }
    };

    // Upsert Homepage Settings
    await prisma.setting.upsert({
        where: { id: 'page.home' },
        update: { jsonContent: homePageContent as any },
        create: {
            id: 'page.home',
            isEnabled: true,
            jsonContent: homePageContent as any,
        },
    });

    // Upsert About Page Settings
    await prisma.setting.upsert({
        where: { id: 'page.about' },
        update: { jsonContent: aboutPageContent as any },
        create: {
            id: 'page.about',
            isEnabled: true,
            jsonContent: aboutPageContent as any,
        },
    });

    console.log("Page content settings seeded successfully.");
}


/**
 * MAIN SEED FUNCTION
 * Executes all seeding tasks in order.
 */
async function main() {
    console.log("Starting database seeding process...");
    
    await seedPaymentGateways();
    await seedDefaultAdmin();
    await seedTranslations();
    await seedPageContent();
    
    console.log('Seeding process finished successfully.');
}

main()
    .catch(e => {
        console.error("An error occurred during the seeding process:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });