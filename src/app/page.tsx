import { Experience } from "@/components/experience";
import { TheRecord } from "@/components/the-record";

/**
 * NULL.
 *
 * "Your code left a world behind." The world is generated from the subject's
 * own commit history and traversed from the first commit to the last. Where
 * WebGL is unavailable the written record is served instead — the same
 * evidence, in text.
 */
export default function Page() {
  return <Experience fallback={<TheRecord />} />;
}
