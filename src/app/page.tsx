import dynamic from 'next/dynamic';
import { FieldRecord } from '@/components/strata/field-record';

/**
 * The record is server-rendered and is the page. The world is layered over it
 * once the client is ready, and never blocks first paint — if it never arrives,
 * or cannot run, what remains is a complete archive rather than a broken shell.
 */
const World = dynamic(() => import('@/components/strata/world'), { ssr: false });

export default function Page() {
  return (
    <main>
      <World />
      <FieldRecord />
    </main>
  );
}
