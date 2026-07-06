export type FamilyRole = "owner" | "admin" | "archivist" | "contributor" | "viewer" | "guest";

export type PersonVisibility = "family" | "restricted" | "private";

export type RelationshipKind =
  | "biological_parent"
  | "adoptive_parent"
  | "foster_parent"
  | "step_parent"
  | "guardian"
  | "spouse"
  | "partner";

export type MediaType = "image" | "video" | "audio" | "document" | "other";

export type DeduplicationDecision = "auto_linked" | "needs_review" | "distinct" | "rejected";

export type SocialProvider =
  | "facebook"
  | "instagram"
  | "whatsapp"
  | "icloud"
  | "google_photos"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "manual_export";

export interface FamilySummary {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  mediaAssetCount: number;
}

export interface PersonSummary {
  id: string;
  familyId: string;
  displayName: string;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
  visibility: PersonVisibility;
  primaryPhotoMediaAssetId?: string;
}

export interface MediaAssetSummary {
  id: string;
  familyId: string;
  mediaType: MediaType;
  capturedAt?: string;
  canonicalSha256?: string;
  storageUri: string;
  byteSize: number;
  provenanceCount: number;
}

export interface MediaInstanceSummary {
  id: string;
  mediaAssetId: string;
  uploadedByUserId?: string;
  sourceApp: string;
  originalFilename: string;
  importedFrom?: SocialProvider;
}

export interface DeduplicationCandidate {
  candidateMediaAssetId: string;
  existingMediaAssetId: string;
  score: number;
  decision: DeduplicationDecision;
  signals: string[];
}

export interface TimelineEventSummary {
  id: string;
  familyId: string;
  personId?: string;
  title: string;
  eventType: string;
  eventDate?: string;
  locationText?: string;
  sourceCount: number;
}

export interface SocialProvenanceSummary {
  provider: SocialProvider;
  externalId: string;
  importedAt: string;
  sourceUrl?: string;
}
