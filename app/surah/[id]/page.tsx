import surahs from "@/public/data/surahs.json";
import SurahPageClient from "@/components/SurahPageClient";

export function generateStaticParams() {
  return (surahs as { id: number }[]).map((s) => ({ id: String(s.id) }));
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurahPageClient surahId={Number(id)} />;
}
