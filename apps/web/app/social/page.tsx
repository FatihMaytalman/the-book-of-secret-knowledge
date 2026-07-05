import type { SocialProvider, SocialProvenanceSummary } from "@aomlegacy/shared";

const providers: Array<{ provider: SocialProvider; status: string; purpose: string }> = [
  {
    provider: "whatsapp",
    status: "manual import first",
    purpose: "Bring family group chat exports into the canonical archive."
  },
  {
    provider: "google_photos",
    status: "OAuth planned",
    purpose: "Sync personal libraries with deduplication and provenance."
  },
  {
    provider: "facebook",
    status: "Graph API review required",
    purpose: "Import and publish permitted family albums and milestones."
  }
];

const provenance: SocialProvenanceSummary[] = [
  {
    provider: "whatsapp",
    externalId: "chat-export:family-group:photo-001",
    importedAt: "2026-07-05T00:00:00.000Z"
  },
  {
    provider: "google_photos",
    externalId: "google-photo:example-asset",
    importedAt: "2026-07-05T00:00:00.000Z"
  }
];

export default function SocialPage() {
  return (
    <section className="panel hero-copy">
      <span className="eyebrow">Social network integration</span>
      <h1 className="headline">Social networks become channels. Family Tree remains the truth.</h1>
      <p className="lede">
        Import memories from external platforms, preserve them in the private family archive, and publish outward only
        after explicit consent and preview.
      </p>

      <div className="section-grid">
        {providers.map((provider) => (
          <article className="content-card" key={provider.provider}>
            <span className="tag">{provider.status}</span>
            <h2>{provider.provider.replace("_", " ")}</h2>
            <p className="muted">{provider.purpose}</p>
          </article>
        ))}
      </div>

      <div className="content-card section-spaced">
        <h2>Imported provenance</h2>
        <p className="muted">
          Every imported memory records where it came from so the family understands context without storing duplicate
          originals.
        </p>
        <div className="stack">
          {provenance.map((item) => (
            <div className="stat-card" key={`${item.provider}-${item.externalId}`}>
              <strong>{item.provider.replace("_", " ")}</strong>
              <p className="muted">
                {item.externalId} · imported {item.importedAt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
