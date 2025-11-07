// components/receipts/ReceiptTemplate.tsx
'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { type Prisma } from '@prisma/client';

// Type kamili ya data
export type ReceiptData = Prisma.PaymentGetPayload<{
    include: {
        invoice: {
            include: {
                lease: {
                    include: {
                        tenant: true,
                        room: { include: { property: true } },
                    },
                },
            },
        } 
    };
}>;
// Jisajili fonts (optional, lakini inaboresha muonekano)
// Pakua .ttf files na uziweke kwenye public/fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
  ]
});

// Weka styling hapa, kama CSS
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, padding: 40, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 20, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  billedToLabel: { color: '#666', fontSize: 10 },
  billedTo: { fontWeight: 'bold', marginTop: 2 },
  table: { width: '100%', border: '1px solid #eee' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableColHeader: { padding: 8, fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableCol: { padding: 8 },
  totalSection: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  totalLabel: { fontSize: 12, color: '#666', marginRight: 10 },
  totalValue: { fontSize: 14, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 9, color: '#aaa' },
});

export default function ReceiptTemplate({ data }: { data: ReceiptData }) {
    const formatCurrency = (amount: number) => `TSh ${amount.toLocaleString()}`;

        if (!data.invoice) {
        return (
            <Document>
                <Page style={styles.page}>
                    <Text>Error: Associated invoice data is missing for this payment.</Text>
                </Page>
            </Document>
        );
    }

    
    return (
        <Document title={`Receipt-${data.id.substring(0,8)}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Payment Receipt</Text>
                        <Text style={styles.subtitle}>Receipt #: {data.id.substring(0, 8)}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>SARAGEA Appartments</Text>
                        <Text style={styles.subtitle}>{data.invoice.lease.room.property.location}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View>
                        <Text style={styles.billedToLabel}>BILLED TO</Text>
                        <Text style={styles.billedTo}>{data.invoice.lease.tenant.name}</Text>
                        <Text>{data.invoice.lease.tenant.email}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text>Payment Date: {format(data.paymentDate, 'PPP')}</Text>
                        <Text>Method: {data.method}</Text>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableColHeader, { width: '70%' }]}>DESCRIPTION</Text>
                        <Text style={[styles.tableColHeader, { width: '30%', textAlign: 'right' }]}>AMOUNT</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: '70%' }]}>
                            <Text>Rent for Room {data.invoice.lease.room.roomNumber}</Text>
                            <Text style={styles.subtitle}>Invoice Due: {format(data.invoice.dueDate, 'PPP')}</Text>
                        </View>
                        <Text style={[styles.tableCol, { width: '30%', textAlign: 'right' }]}>{formatCurrency(data.amount)}</Text>
                    </View>
                </View>

                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>TOTAL PAID</Text>
                    <Text style={styles.totalValue}>{formatCurrency(data.amount)}</Text>
                </View>

                <Text style={styles.footer}>
                    Thank you for your business! This is an official receipt. &copy; {new Date().getFullYear()} SARAGEA Appartments.
                </Text>
            </Page>
        </Document>
    );
}