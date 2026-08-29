'use client';

import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { FORMATIONS } from '@/data/strata';
import { fmtDate, fmtSize, fmtDepth, centreOf, type Band } from '@/lib/core';
import { VEINS } from '@/data/strata';

/**
 * The margin.
 *
 * One annotation, for the layer the reading head is inside. It sets when the
 * head enters and holds until the head leaves — it does not fade in and out on
 * every scroll event, because a field note does not flicker.
 */
export const Marginalia = forwardRef<HTMLDivElement, {
  band: Band;
  inVoid: boolean;
  onOpen: () => void;
}>(function Marginalia({ band, inVoid, onOpen }, ref) {
  const formation = FORMATIONS.find((f) => f.id === band.layer.formation)!;

  return (
    <div
      ref={ref}
      className="margin-slot reading-slot pointer-events-none fixed left-0 top-0 z-30 flex h-full w-full items-center"
    >
      <div className="w-full max-w-[27rem]">
        {inVoid ? (
            <motion.div
              key="void"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mono mb-3">Barren interval</div>
              <p className="prose-field field-note">
                No deposition. Nothing was pushed here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={band.layer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* instrument line */}
              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="mono" style={{ color: formation.pigment }}>
                  {formation.name}
                </span>
                <span className="mono">{fmtDepth(centreOf(band))}</span>
                <span className="mono">{fmtDate(band.layer.created)}</span>
              </div>

              <h2
                className="mb-1 font-[var(--serif)] text-[length:var(--t-42)] font-normal leading-[1.02] tracking-[-0.017em] text-[var(--ink)]"
                style={{ fontFamily: 'var(--serif)' }}
              >
                {band.layer.title}
              </h2>

              <div className="mono mb-6 flex flex-wrap gap-x-3 gap-y-1">
                <span>{band.layer.repo}</span>
                <span aria-hidden>·</span>
                <span>{band.layer.language ?? 'no language'}</span>
                <span aria-hidden>·</span>
                <span>{fmtSize(band.layer.sizeKb)}</span>
                {band.layer.stars > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{band.layer.stars} star{band.layer.stars > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>

              <p className="prose-field field-note mb-6">{band.layer.note}</p>

              <div className="pointer-events-auto flex flex-wrap items-center gap-x-6 gap-y-2">
                <button onClick={onOpen} className="mono mono-11 text-[var(--ink)]">
                  <span className="ink-link" style={{ backgroundSize: '100% 1px' }}>
                    Cut this layer
                  </span>
                </button>
                {band.layer.veins.length > 0 && (
                  <span className="mono">
                    cuts{' '}
                    {band.layer.veins
                      .map((v) => VEINS.find((x) => x.id === v)?.name ?? v)
                      .join(' · ')}
                  </span>
                )}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
});
