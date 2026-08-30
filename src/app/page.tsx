import { Game } from "@/components/game";
import { TextFallback } from "@/components/text-fallback";

/**
 * NULL.
 *
 * "Your code left a world behind." The world is generated from the subject's
 * own commit history and traversed from the first commit to the last. Where
 * WebGL is unavailable the text layer is served instead.
 */
export default function Page() {
  return (
    <Game fallback={<TextFallback />} />
  );
}
