import type { PersonSummary } from "@aomlegacy/shared";

const people: PersonSummary[] = [
  {
    id: "person-founder",
    familyId: "family-aom",
    displayName: "Fatih Maytalman",
    isLiving: true,
    visibility: "family"
  },
  {
    id: "person-grandparent",
    familyId: "family-aom",
    displayName: "Grandparent Profile",
    birthDate: "1940-01-01",
    isLiving: false,
    visibility: "family"
  },
  {
    id: "person-child",
    familyId: "family-aom",
    displayName: "Next Generation",
    isLiving: true,
    visibility: "restricted"
  }
];

export default function PeoplePage() {
  return (
    <section className="panel hero-copy">
      <span className="eyebrow">Family profiles</span>
      <h1 className="headline">Every person becomes a living timeline.</h1>
      <p className="lede">
        Profiles connect media, documents, stories, places, relationships, and AI-assisted summaries while respecting
        privacy for living relatives and minors.
      </p>
      <div className="section-grid">
        {people.map((person) => (
          <article className="content-card" key={person.id}>
            <span className="tag">{person.visibility}</span>
            <h2>{person.displayName}</h2>
            <p className="muted">
              {person.isLiving ? "Living profile" : "Memorial profile"}
              {person.birthDate ? ` · born ${person.birthDate}` : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
