import { ImageResponse } from "next/og";
import { finding, subject } from "@/data/record";
import { entities } from "@/world/telemetry";

/**
 * The share card.
 *
 * Generated rather than drawn, from the same two numbers the world is built
 * from, so it cannot drift out of step with the record. No portrait and no
 * screenshot: a frame of the world reproduces badly at card size, and the
 * finding is the thing worth reading in a feed.
 */
export const alt = `${subject.name} — a world generated from a commit history`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const commits = entities.reduce((n, e) => n + e.commits, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 76px",
          background: "linear-gradient(160deg, #10161a 0%, #0d0f10 55%, #080a0b 100%)",
          color: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21 }}>
          <span style={{ color: "#747e84", letterSpacing: 6 }}>NULL</span>
          <span style={{ color: "#747e84", letterSpacing: 3 }}>{subject.filedAs}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, lineHeight: 1.08, letterSpacing: -1, maxWidth: 980 }}>
            {finding.headline}
          </div>
          <div style={{ marginTop: 30, fontSize: 25, color: "#9eaab0", maxWidth: 900 }}>
            A world generated from a real commit history. Walk forward and you
            walk through it, first commit to last.
          </div>
        </div>

        <div style={{ display: "flex", gap: 54, fontSize: 21, color: "#747e84", letterSpacing: 2 }}>
          <span>{entities.length} REPOSITORIES</span>
          <span>{commits} COMMITS</span>
          <span>{subject.role.toUpperCase()}</span>
        </div>
      </div>
    ),
    size,
  );
}
