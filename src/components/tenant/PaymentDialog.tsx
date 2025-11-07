// components/tenant/PaymentDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { type Invoice, type PaymentGateway } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentDialog({ invoice }: { invoice: Invoice }) {
    const [gateways, setGateways] = useState<PaymentGateway[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Pata gateways zinazofanya kazi tu
        fetch('/api/gateways?enabled=true')
            .then(res => res.json())
            .then(data => setGateways(data));
    }, []);

    const handlePayment = async (provider: string) => {
        setIsLoading(true);
        setSelectedGateway(provider);
        try {
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: invoice.id,
                    amount: invoice.amount,
                    gatewayProvider: provider,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // Redirect kwenda kwenye ukurasa wa malipo
            window.location.href = data.redirectUrl;

        } catch (error: unknown) {

                let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
            toast({ variant: 'destructive', title: 'Error', description: message });
            setIsLoading(false);
            setSelectedGateway(null);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">Pay Now</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choose Payment Method</DialogTitle>
                    <DialogDescription>Select a provider to complete your payment for invoice due on {format(invoice.dueDate, 'PPP')}.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {gateways.length > 0 ? gateways.map(gw => (
                        <Button
                            key={gw.id}
                            className="w-full"
                            size="lg"
                            disabled={isLoading}
                            onClick={() => handlePayment(gw.provider)}
                        >
                            {isLoading && selectedGateway === gw.provider && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Pay with {gw.name}
                        </Button>
                    )) : <p className="text-center text-muted-foreground">No online payment methods are enabled. Please contact management.</p>}
                </div>
            </DialogContent>
        </Dialog>
    );
}