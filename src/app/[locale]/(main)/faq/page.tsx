import { setRequestLocale } from "next-intl/server";
import FaqClient from "./FaqClient";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <FaqClient />;
}
