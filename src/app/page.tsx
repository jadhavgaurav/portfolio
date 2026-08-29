import { Arrival } from "@/components/arrival";
import { Colophon } from "@/components/colophon";
import { Exhibits } from "@/components/exhibits";
import { Finding } from "@/components/finding";
import { IndexNav } from "@/components/index-nav";
import { Ledger } from "@/components/ledger";
import { Recursion } from "@/components/recursion";
import { Unclaimed } from "@/components/unclaimed";

/**
 * The document, in reading order.
 *
 * Arrival states the finding and the rules. The finding argues it. The
 * chronology shows the shape of the whole record at once — the one inverted
 * section. The exhibits go deep on six pieces of work. The recursion shows
 * how he actually works. Not-claimed names the limits. The colophon closes.
 */
export default function Page() {
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
