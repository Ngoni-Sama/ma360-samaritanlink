import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RUNS } from "@/data/review";
import { ReviewPage } from "@/components/review/ReviewPage";

export const metadata: Metadata = { title: "Test recordings — MA360 SamaritanLink", robots: { index: false, follow: false } };
export const dynamicParams = false;

export function generateStaticParams() {
  return RUNS.map((r) => ({ run: r.id }));
}

export default function ReviewRun({ params }: { params: { run: string } }) {
  const run = RUNS.find((r) => r.id === params.run);
  if (!run) notFound();
  return <ReviewPage run={run} />;
}
