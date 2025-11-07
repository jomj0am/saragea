// components/cart/PaymentMethods.tsx
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Weka logos kwenye public/logos
const logos = [
    { src: '/logos/mpesa.png', alt: 'M-Pesa' },
    { src: '/logos/tigopesa.png', alt: 'Tigo Pesa' },
    { src: '/logos/airtelmoney.png', alt: 'Airtel Money' },
    { src: '/logos/halopesa.png', alt: 'HaloPesa' },
    { src: '/logos/visa.png', alt: 'Visa' },
    { src: '/logos/mastercard.png', alt: 'Mastercard' },
];

export default function PaymentMethods() {
    const t = useTranslations('CartPage');
    return (
        <div className="mt-6">
            <p className="text-center text-sm font-semibold text-muted-foreground mb-4">
                {t('paymentMethodsTitle')}
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                {logos.map(logo => (
                    <div key={logo.alt} className="relative h-12 sm:w-14 w-12  opacity-60">
                        <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
}