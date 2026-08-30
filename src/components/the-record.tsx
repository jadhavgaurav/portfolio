import { Arrival } from "@/components/arrival";
import { Colophon } from "@/components/colophon";
import { Exhibits } from "@/components/exhibits";
import { Finding } from "@/components/finding";
import { IndexNav } from "@/components/index-nav";
import { Ledger } from "@/components/ledger";
import { Recursion } from "@/components/recursion";
import { Unclaimed } from "@/components/unclaimed";

/**
 * The written record.
 *
 * Served at /record, and used as the non-WebGL fallback for the world. It is
 * a complete version of the same evidence, not a stub: the world is the
 * primary interface, and this is the text one.
 */
export function TheRecord() {
  return (
    <>
      <IndexNav />
      <main>
        <Arrival />
        <Finding />
        <Ledger />
        <Exhibits />
        <Recursion />
        <Unclaimed />
        <Colophon />
      </main>
    </>
  );
}
