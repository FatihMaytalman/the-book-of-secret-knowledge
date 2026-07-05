import type { DeduplicationCandidate } from "@aomlegacy/shared";

const candidates: DeduplicationCandidate[] = [
  {
    candidateMediaAssetId: "media-whatsapp-copy",
    existingMediaAssetId: "media-family-photo",
    score: 1,
    decision: "auto_linked",
    signals: ["sha256", "source_filename", "uploaded_by_family_member"]
  },
  {
    candidateMediaAssetId: "media-instagram-resize",
    existingMediaAssetId: "media-family-photo",
    score: 0.91,
    decision: "needs_review",
    signals: ["perceptual_hash", "face_overlap", "capture_window"]
  }
];

export default function ReviewPage() {
  return (
    <section className="panel hero-copy">
      <span className="eyebrow">Archive review</span>
      <h1 className="headline">Duplicates disappear without losing provenance.</h1>
      <p className="lede">
        Each uploaded or imported file is evaluated as a media instance. Exact copies auto-link to the canonical memory;
        near-duplicates wait for family review before any storage decision becomes final.
      </p>
      <div className="stack">
        {candidates.map((candidate) => (
          <article className="content-card" key={candidate.candidateMediaAssetId}>
            <span className="tag">{candidate.decision.replace("_", " ")}</span>
            <h2>{Math.round(candidate.score * 100)}% duplicate confidence</h2>
            <p className="muted">
              Candidate <strong>{candidate.candidateMediaAssetId}</strong> compared with canonical asset{" "}
              <strong>{candidate.existingMediaAssetId}</strong>.
            </p>
            <p className="muted">Signals: {candidate.signals.join(", ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
