# Family Tree - Full Execution Team

Project: **Family Tree**  
Organization: **AOM Legacy**  
Domain: **AOMLegacy.com**  
Founder: **Fatih Maytalman**

## Purpose

This document defines the full team required to execute the Family Tree platform with world-class product, engineering, security, AI, infrastructure, design, and operational discipline.

No team can guarantee "perfect" execution. The practical standard is better: build a team and operating model that makes excellence repeatable, risks visible, quality measurable, and failures recoverable.

## Team design principles

1. **Founder-led vision, delegated execution.** The founder owns mission, values, taste, and final product direction. Senior functional leaders own execution quality in their domains.
2. **Small senior core first.** The early team should be compact and experienced. Avoid a large junior-heavy team before architecture, product boundaries, and operating discipline are stable.
3. **Privacy and preservation are core competencies.** Security, compliance, backups, exports, and long-term data portability are not side tasks.
4. **Media reliability before AI flash.** The WhatsApp duplicate and upload problem must be solved before advanced AI becomes the product headline.
5. **AI is a product layer, not a shortcut.** AI capabilities require data governance, citations, evaluation, privacy routing, and human review workflows.
6. **Self-hosted and cloud teams must collaborate from day one.** The home-server MVP cannot become a dead end.

---

# 1. Executive and product leadership

## 1.1 Founder / CEO

**Accountable for**

- Company mission and product taste.
- Funding, partnerships, legal entity setup, and strategic positioning.
- Final decisions on values, privacy posture, and brand promise.
- Recruiting executive-level leaders.

**Key decisions**

- Self-hosted vs hosted product packaging.
- Family privacy philosophy.
- Pricing strategy.
- Public launch timing.

## 1.2 Chief Product Officer / Head of Product

**Accountable for**

- Product requirements.
- Roadmap sequencing.
- User research with real families.
- MVP definition and acceptance criteria.
- Pricing/package feature boundaries.

**Must be strong in**

- Consumer product intuition.
- Privacy-sensitive collaboration products.
- Media, family, or knowledge-management workflows.
- Turning emotional user problems into simple product experiences.

## 1.3 Chief Technology Officer / VP Engineering

**Accountable for**

- Architecture integrity.
- Engineering execution.
- Technical hiring.
- Build-vs-buy decisions.
- Reliability, performance, and scalability.
- Engineering process and quality gates.

**Must be strong in**

- Full-stack architecture.
- Media/storage systems.
- Self-hosted and cloud infrastructure.
- Security-first engineering.
- Growing teams without creating process drag.

## 1.4 Chief Design Officer / Head of Design

**Accountable for**

- Brand experience.
- Design system.
- Accessibility.
- UX research.
- Emotional quality of the product.
- Design reviews across web and mobile.

**Must be strong in**

- Consumer-grade simplicity.
- Complex data visualization.
- Multi-generational usability.
- Premium visual systems.
- Accessibility for older adults.

## 1.5 Chief Security and Privacy Officer

**Accountable for**

- Security architecture.
- Threat modeling.
- Privacy policy requirements.
- GDPR readiness.
- Upload safety.
- Incident response.
- Security reviews before release.

**Must be strong in**

- Consumer identity and access control.
- Privacy engineering.
- Secure file upload pipelines.
- Cloud and self-hosted threat models.
- Incident response and audit logging.

---

# 2. Product squads

The project should be organized into squads with clear product ownership. Early on, one senior engineer may cover multiple squads, but the ownership model should be explicit from the start.

## 2.1 Media and Deduplication Squad

**Mission:** Solve the WhatsApp problem completely.

**Owns**

- Immich integration.
- Mobile upload ingestion path.
- Canonical media asset model.
- Exact duplicate detection.
- Perceptual image/video deduplication.
- Media metadata extraction.
- Thumbnails and derivatives.
- Media review queue.

**Core roles**

- Staff media/storage engineer.
- Backend engineer.
- Computer vision engineer.
- Mobile sync engineer.
- QA automation engineer.

**Key success metrics**

- Duplicate storage avoided.
- Upload completion rate.
- False merge rate.
- Time from upload to searchable memory.
- Media processing backlog.

## 2.2 Family Tree and Heritage Graph Squad

**Mission:** Model complex real families accurately and respectfully.

**Owns**

- Person profiles.
- Family relationships.
- Neo4j graph model.
- Relationship validation.
- Duplicate person merging.
- Timeline events.
- Source citations.
- Family tree visualization APIs.

**Core roles**

- Backend/domain engineer.
- Graph database engineer.
- Frontend tree-visualization engineer.
- Genealogy/domain advisor.
- QA engineer.

**Key success metrics**

- Relationship edit success rate.
- Merge accuracy.
- Tree render performance.
- Number of profiles enriched with verified sources.

## 2.3 AI Heritage Squad

**Mission:** Make the archive searchable, understandable, and narratable without compromising privacy.

**Owns**

- AI Heritage Assistant.
- OCR and document understanding.
- Speech transcription.
- Translation.
- Biography generation.
- Semantic search.
- Face recognition review workflows.
- AI evaluation and safety.

**Core roles**

- Principal AI architect.
- Machine learning engineer.
- Data engineer.
- Backend AI workflow engineer.
- AI product designer.
- Evaluation engineer.

**Key success metrics**

- Citation coverage.
- AI suggestion acceptance rate.
- Hallucination/unsupported-answer rate.
- Retrieval permission violations: target zero.
- OCR/transcription accuracy by document type/language.

## 2.4 Collaboration and Governance Squad

**Mission:** Let families work together safely and respectfully.

**Owns**

- Invitations.
- Permissions.
- Comments.
- Stories.
- Approval workflows.
- Version history.
- Notifications.
- Memorial page governance.

**Core roles**

- Product manager.
- Backend engineer.
- Frontend engineer.
- UX researcher.
- Trust and safety advisor.

**Key success metrics**

- Invite activation.
- Contribution rate.
- Sensitive-edit approval completion.
- Reported privacy conflicts.

## 2.5 Platform and Infrastructure Squad

**Mission:** Make the product reliable on a home server today and cloud infrastructure tomorrow.

**Owns**

- Docker Compose.
- Ubuntu setup.
- Drive mounting.
- Backups and restore.
- Observability.
- Tailscale and remote access.
- Cloud migration to R2/S3 and Kubernetes.
- CI/CD.

**Core roles**

- Principal infrastructure engineer.
- Site reliability engineer.
- DevOps engineer.
- Database reliability engineer.
- Security engineer.

**Key success metrics**

- Backup success rate.
- Restore test success.
- Uptime.
- Mean time to recovery.
- Deployment failure rate.
- Storage health alerts.

## 2.6 Web Experience Squad

**Mission:** Build the premium browser experience for family archive, profiles, timeline, and admin workflows.

**Owns**

- Next.js app.
- Design system implementation.
- Family dashboard.
- Timeline.
- Media grid.
- Person profiles.
- Review queues.
- Admin settings.

**Core roles**

- Frontend lead.
- Product designer.
- Design systems engineer.
- Accessibility specialist.
- QA automation engineer.

**Key success metrics**

- Core Web Vitals.
- Task completion rate.
- Accessibility pass rate.
- Time to find a memory.

## 2.7 Mobile Experience Squad

**Mission:** Make family contribution effortless from phones.

**Owns**

- React Native / Expo app.
- Mobile authentication.
- Family dashboard.
- Voice stories.
- Review tasks.
- Future native background sync module.
- Camera and media library integration.

**Core roles**

- React Native lead.
- iOS engineer.
- Android engineer.
- Mobile QA engineer.
- Mobile product designer.

**Key success metrics**

- Upload reliability.
- App crash-free sessions.
- Push notification opt-in quality.
- Voice story creation rate.

---

# 3. Shared specialist functions

## 3.1 Genealogy and family history advisors

**Why needed:** Family relationships, adoption, divorce, step-family structures, source quality, and historical context require domain expertise.

**Responsibilities**

- Validate relationship model.
- Guide terminology and respectful UX.
- Advise GEDCOM/export compatibility.
- Help define source citation standards.

## 3.2 Archivist / digital preservation specialist

**Why needed:** The project promises 50+ year accessibility.

**Responsibilities**

- Define archival formats.
- Define metadata standards.
- Validate export bundles.
- Recommend media/document preservation practices.
- Guide family book and legacy package workflows.

## 3.3 Legal and privacy counsel

**Responsibilities**

- GDPR readiness.
- Terms and privacy policy.
- Data processing agreements.
- Minor data handling.
- Right-to-erasure policy.
- Memorial/deceased-person data policies.

## 3.4 Customer support and family onboarding

**Responsibilities**

- Self-hosted setup support.
- Family invite/onboarding assistance.
- Documentation.
- Feedback collection.
- Support escalation.

## 3.5 Quality engineering

**Responsibilities**

- Test strategy.
- End-to-end testing.
- Media processing regression tests.
- Security test coordination.
- Backup/restore verification.
- Accessibility testing.

---

# 4. Phase-based staffing plan

## 4.1 Phase 0-1: Self-hosted MVP core team

Keep the team small, senior, and execution-focused.

| Role | Coverage |
| --- | --- |
| Founder / product owner | Vision, requirements, acceptance |
| Fractional CTO or principal architect | Architecture and technical leadership |
| Senior full-stack engineer | NestJS, Next.js, integrations |
| Senior infrastructure engineer | Ubuntu, Docker, drives, backups, Tailscale |
| Media/storage engineer | Immich integration, dedup pipeline |
| Product designer | Core UX and design system |
| Security/privacy advisor | Threat model and baseline controls |
| QA engineer | Manual and automated MVP validation |

## 4.2 Phase 2-3: Family tree and AI expansion

Add specialized depth after the media foundation is reliable.

| Role | Trigger |
| --- | --- |
| Graph database engineer | Neo4j family relationships begin |
| AI/ML engineer | OCR, embeddings, biography, semantic search |
| Data engineer | AI pipelines and export reliability |
| Mobile engineer | AOM mobile app beyond Immich |
| Genealogy advisor | Complex relationship model validation |
| Accessibility specialist | Broad family beta |

## 4.3 Phase 4: Cloud scale and public launch

Add operational maturity and customer-facing capacity.

| Role | Trigger |
| --- | --- |
| SRE / platform engineer | Hosted deployments and uptime targets |
| Cloud security engineer | Multi-tenant hosted product |
| Support lead | Private beta families onboarded |
| Growth/product marketing | AOMLegacy.com launch |
| Legal/privacy counsel | Public beta and paid plans |
| Technical writer | Self-hosted and hosted documentation |

## 4.4 Phase 5: Enterprise and growth

Add enterprise-grade functions only once consumer/family core is excellent.

| Role | Trigger |
| --- | --- |
| Enterprise product manager | White-label/API offering |
| Solutions architect | Institution deployments |
| Compliance lead | Enterprise security/compliance requests |
| Sales/customer success | Paid institutional accounts |
| Partnerships lead | Archives, genealogy, museums, print partners |

---

# 5. First 10 hires or contributors

If starting from zero, prioritize this order:

1. **Principal full-stack architect** - owns technical foundation across API, web, data, and integration.
2. **Infrastructure/self-hosting engineer** - makes home-server deployment reliable.
3. **Media and deduplication engineer** - solves the central WhatsApp problem.
4. **Product designer** - defines premium multi-generational UX.
5. **Security/privacy advisor** - establishes threat model and privacy baseline early.
6. **Backend engineer** - accelerates NestJS, PostgreSQL, Neo4j, queues, audit.
7. **Frontend engineer** - builds Next.js dashboard, timeline, profiles, review flows.
8. **AI/ML engineer** - adds OCR, embeddings, biography, and evaluation discipline.
9. **Mobile engineer** - builds Expo app and later native background sync.
10. **QA/automation engineer** - builds regression safety around upload, dedup, backup, and permissions.

---

# 6. RACI ownership matrix

| Area | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Product vision | Founder, CPO | Founder | Design, CTO | All |
| MVP scope | CPO | Founder | CTO, Design, Security | All |
| System architecture | CTO, Principal architect | CTO | Security, Infra, AI | Product |
| Security architecture | Security lead | CTO / Security lead | Legal, Infra | All |
| Media ingestion | Media squad | CTO | Product, Infra | Support |
| Deduplication policy | Media squad, Product | CPO / CTO | Security, Archivist | All |
| Family graph model | Graph squad | CTO | Genealogy advisor, Product | Design |
| AI outputs policy | AI squad, Product | CPO / Security lead | Legal, Genealogy | All |
| Design system | Design lead | Head of Design | Frontend, Product | All |
| Home server operations | Infrastructure squad | CTO | Security, Support | Product |
| Backups/restore | Infrastructure squad | CTO | Security, Archivist | Founder |
| Public launch readiness | Product, Engineering, Security | Founder | Legal, Support | All |

---

# 7. Operating cadence

## Weekly

- Product/engineering planning.
- Design review.
- Architecture review for cross-cutting changes.
- Security/privacy review for sensitive workflows.
- Demo of working software.
- Risk register review.

## Per milestone

- Threat model update.
- Data model review.
- Accessibility check.
- Backup/restore verification if storage changes.
- AI evaluation if model/prompt/retrieval changes.
- Performance review for media-heavy workflows.

## Before any release

- Regression suite passes.
- Upload safety checks pass.
- Permission tests pass.
- Audit log coverage checked.
- Backup status green.
- Rollback plan documented.
- Known risks listed with owner and mitigation.

---

# 8. Definition of done

No feature is complete until:

1. Product acceptance criteria are met.
2. Security and privacy implications are reviewed.
3. Audit events exist for sensitive mutations.
4. Tests cover expected and failure paths.
5. Accessibility has been considered.
6. Documentation or runbooks are updated where relevant.
7. Data export/portability impact is understood.
8. Observability exists for operationally important flows.
9. Rollback or recovery path is known.

---

# 9. Quality gates by subsystem

## Media and deduplication

- Exact duplicate tests.
- Near-duplicate review tests.
- Original file checksum validation.
- Upload interruption/retry tests.
- Malware scan enforcement.
- No irreversible delete without retention policy.

## Family graph

- Cycle prevention tests.
- Complex family relationship tests.
- Merge/unmerge workflow tests.
- Relationship path accuracy tests.
- Export consistency tests.

## AI

- Retrieval permission tests.
- Citation coverage tests.
- Prompt/version tracking.
- Hallucination evaluation set.
- Human review workflow.
- Sensitive data routing policy.

## Security

- MFA path tested.
- RBAC/ABAC tests.
- Rate limit tests.
- Secret scanning.
- Dependency scanning.
- Incident response dry run before public launch.

## Infrastructure

- Backup success.
- Restore test.
- Disk failure simulation or documented drill.
- Container health checks.
- Deployment rollback.
- Monitoring alerts.

---

# 10. Tooling recommendations

## Product and planning

- Linear, GitHub Issues, or Notion for roadmap and tasks.
- Figma for design system and prototypes.
- Product analytics with privacy controls.
- User research repository for family interviews.

## Engineering

- GitHub pull requests.
- CI for lint, tests, type checks, dependency scanning.
- Docker Compose for Phase 1.
- Infrastructure-as-code for cloud phases.
- ADRs for architectural decisions.

## Security

- Secret scanning.
- Dependency vulnerability scanning.
- Static analysis.
- Container image scanning.
- Malware scanning for uploads.
- Audit log dashboard.

## Observability

- Structured logs.
- Metrics for uploads, queues, backups, AI jobs, and errors.
- Alerting for disk usage, failed backups, queue backlogs, and auth anomalies.

---

# 11. Communication rules

1. Product decisions must state the user problem, tradeoff, and success metric.
2. Architecture decisions must be documented as ADRs.
3. Security concerns block release until risk is accepted by accountable leadership.
4. AI-generated family facts are never silently promoted.
5. Family privacy conflicts are product issues, not edge cases.
6. Every critical workflow must have a named owner.

---

# 12. Near-term execution board

## Now

- Finalize MVP requirements.
- Scaffold repository structure.
- Build Docker Compose home-server baseline.
- Deploy Immich locally.
- Implement AOM canonical media model.
- Implement exact duplicate detection.
- Create first profile and timeline flows.

## Next

- Add review queue for duplicate candidates and face tags.
- Integrate Neo4j relationship model.
- Build backup health dashboard.
- Add export bundle generation.
- Add OCR prototype.

## Later

- AI Heritage Assistant.
- React Native app.
- R2/S3 migration.
- Kubernetes deployment.
- Paid family plans.
- Enterprise/white-label offering.

---

# 13. Leadership scorecard

Use this scorecard to determine whether the team is executing at the required standard.

| Dimension | Excellent looks like |
| --- | --- |
| Product | Families immediately understand why the product matters |
| UX | Grandparents and children can complete core tasks without training |
| Engineering | The system is modular, tested, observable, and recoverable |
| Security | Sensitive data has explicit controls, logs, and review paths |
| AI | Outputs are cited, permission-aware, and human-reviewable |
| Infrastructure | Backups and restores are proven, not assumed |
| Media | Uploads are reliable and duplicates are eliminated safely |
| Preservation | Exports are complete, open, and documented |
| Team | Ownership is clear and risks surface early |

---

# 14. Recommended immediate founder actions

1. Choose the first technical lead: principal full-stack architect or fractional CTO.
2. Choose the first infrastructure lead for home-server deployment.
3. Run interviews with 5-10 family members across age groups.
4. Collect representative WhatsApp media exports for dedup testing.
5. Define the first family archive acceptance test: upload, dedup, profile link, timeline, backup, export.
6. Establish private security reporting before any external beta.
7. Keep the team senior and compact until the MVP is demonstrably useful.
