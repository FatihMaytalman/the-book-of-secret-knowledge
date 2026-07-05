import Link from "next/link";

const stats = [
  { value: "1", label: "canonical family archive" },
  { value: "0", label: "duplicate copies by design" },
  { value: "50+", label: "year preservation horizon" }
] as const;

const priorities = [
  {
    title: "WhatsApp problem solver",
    body: "Exact hashes, perceptual fingerprints, and source provenance turn repeated family uploads into one canonical memory."
  },
  {
    title: "Living family museum",
    body: "Profiles, timelines, documents, voice stories, and social imports become a calm private archive."
  },
  {
    title: "Self-hosted first",
    body: "Immich, Docker, Tailscale, local drives, backups, and exportable metadata make the home server useful immediately."
  }
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="panel hero-copy">
          <span className="eyebrow">Private family legacy platform</span>
          <h1 className="headline">One family. One archive. Every memory preserved.</h1>
          <p className="lede">
            Family Tree combines self-hosted media storage, genealogy, AI heritage assistance, and a private family
            social layer so the family's story is owned by the family instead of scattered across devices and platforms.
          </p>
          <div className="actions">
            <Link className="button button-primary" href="/review">
              Review duplicates
            </Link>
            <Link className="button button-secondary" href="/people">
              Open family profiles
            </Link>
          </div>
          <div className="stat-grid" aria-label="Family Tree product metrics">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <aside className="panel sidebar" aria-label="System readiness">
          <span className="tag">Phase 1 foundation</span>
          <h2>Home server readiness</h2>
          <div className="stack">
            <div className="content-card">
              <strong>Immich media core</strong>
              <p className="muted">Mobile uploads, thumbnails, and initial media indexing run through the self-hosted stack.</p>
            </div>
            <div className="content-card">
              <strong>Backup discipline</strong>
              <p className="muted">Nightly media mirrors plus database dumps protect the archive before scale work begins.</p>
            </div>
            <div className="content-card">
              <strong>Social hub future</strong>
              <p className="muted">External platforms become import and publish channels; Family Tree remains the truth.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-grid" aria-label="Product priorities">
        {priorities.map((priority) => (
          <article className="content-card" key={priority.title}>
            <h2>{priority.title}</h2>
            <p className="muted">{priority.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
