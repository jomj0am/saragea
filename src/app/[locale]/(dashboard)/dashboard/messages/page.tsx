import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { redirect } from "next/navigation";
import MessagingInterface from "@/components/messaging/MessagingInterface";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login?callbackUrl=/dashboard/messages`);
  }

  return (
    <div className="h-[calc(100vh-220px)] w-full bg-background rounded-2xl overflow-hidden border shadow-sm">
      <MessagingInterface />
    </div>
  );
}
