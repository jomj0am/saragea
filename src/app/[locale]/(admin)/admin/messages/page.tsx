// Mfano wa app/(admin)/admin/messages/page.tsx
import MessagingInterface from '@/components/messaging/MessagingInterface';

export default function MessagesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Messages</h1>
            <MessagingInterface />
        </div>
    );
}