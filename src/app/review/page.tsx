import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RUNS } from "@/data/review";
import { ReviewPage } from "@/components/review/ReviewPage";

export const metadata: Metadata = { title: "Test recordings — MA360 SamaritanLink", robots: { index: false, follow: false } };

export default function LatestReview() {
  if (!RUNS[0]) notFound();
  return <ReviewPage run={RUNS[0]} />;
}
