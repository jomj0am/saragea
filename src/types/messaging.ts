// types/messaging.ts
import { type Conversation, type Message,  type Reservation, type User, type Room, type Property } from '@prisma/client';

// 'User' object ndogo tu yenye data tunayohitaji
export type SimpleUser = Pick<User, 'id' | 'name' | 'image'>;

// 'Message' object iliyojumuisha 'sender'
export type MessageWithSender = Message & {
    sender: SimpleUser;
};

// 'Conversation' object kamili tunayoipata kutoka API
export type ConversationWithDetails = Conversation & {
    tenant: SimpleUser;
    admin: SimpleUser;
    messages: Message[]; // Ujumbe wa mwisho
    otherParty: SimpleUser;
    _count: {
        messages: number; // Idadi ya meseji ambazo hazijasomwa
    };
};

// 'Type' kwa ajili ya mazungumzo ya muda (pseudo-conversation)
export type PseudoConversation = {
    id: string; // e.g., "new-USER_ID"
    otherParty: SimpleUser;
    isPseudo: true; // Tofautisha na mazungumzo halisi
};


export type ReservationWithDetails = Reservation & {
    user: Pick<User, 'name'>;
    room: Room & {
        property: Pick<Property, 'name'>;
    };
};

