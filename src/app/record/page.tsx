import type { Metadata } from "next";
import { TheRecord } from "@/components/the-record";

export const metadata: Metadata = {
  title: "The Record — Gaurav Vijay Jadhav",
  description:
    "The written record: every claim with its source, and the claims the evidence cannot support named and left unmade.",
};

export default function RecordPage() {
  return (
    <div className="record-page">
      <TheRecord />
    </div>
  );
}
