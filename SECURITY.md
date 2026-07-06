# Security Policy

Family Tree by AOM Legacy is designed to store highly sensitive family media, documents, stories, relationships, and memorial records. Security and privacy issues should be treated as high priority even during the self-hosted MVP phase.

## Supported versions

The project is currently in planning and pre-MVP development. Until the first tagged release, security fixes apply to the active default branch and current feature branches only.

| Version | Supported |
| --- | --- |
| Pre-MVP / unreleased | Active development only |
| Tagged stable releases | To be defined before public launch |

## Reporting a vulnerability

Do not disclose vulnerabilities publicly before maintainers have had a reasonable opportunity to investigate and remediate them.

For now, report issues privately to the project owner/maintainer. A dedicated security contact should be published before any public beta of AOMLegacy.com.

Please include:

- affected component or file,
- reproduction steps,
- expected impact,
- whether sensitive data may be exposed,
- and any suggested mitigation.

## Security baseline

The platform must maintain the following controls as first-class requirements:

- MFA for administrators and strongly recommended MFA for all users.
- Role-based and attribute-based access controls for family data.
- TLS for all browser/API access.
- Tailscale or equivalent private tunnel for home-server remote access.
- Password hashing with a modern memory-hard algorithm.
- Encryption at rest for disks and application-level encryption for highly sensitive documents where feasible.
- Append-only audit logging for authentication, permissions, uploads, deletes, relationship edits, AI jobs, exports, and backup/restore actions.
- Malware scanning and content validation for all uploads.
- Soft-delete and retention workflows for media and profile data.
- Backup manifests with checksums and documented restore tests.

## Upload safety

All media and document uploads should follow this pipeline:

1. Authenticate and authorize the uploader.
2. Store the file in staging or quarantine.
3. Calculate a cryptographic hash.
4. Validate declared and detected content type.
5. Run malware scanning.
6. Extract metadata in a constrained worker.
7. Generate thumbnails or derivatives safely.
8. Run duplicate detection.
9. Promote only validated files to canonical storage.

## AI privacy

AI features must not bypass permissions. Retrieval-augmented answers, biographies, OCR cleanup, translations, and relationship suggestions must respect family membership, living-person privacy, minor protections, sensitivity labels, and document-level access controls.

AI-generated historical claims should remain suggestions or drafts until accepted by an authorized user and should cite their sources where applicable.
