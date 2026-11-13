import type { ActorContext, CaseStatus, Stage } from "@/types";
import { memoryRepository } from "@/lib/repository/memory";
import { newId, newRequestId } from "@/lib/utils/id";

export function writeAudit(input: {
  actor: ActorContext;
  action: string;
  caseId?: string | null;
  stage?: Stage | null;
  oldStatus?: CaseStatus | null;
  newStatus?: CaseStatus | null;
  requestId?: string;
  metadata?: Record<string, unknown>;
}) {
  memoryRepository.addAudit({
    eventId: newId(),
    actorUserId: input.actor.user.userId,
    caseId: input.caseId ?? null,
    action: input.action,
    stage: input.stage ?? null,
    oldStatus: input.oldStatus ?? null,
    newStatus: input.newStatus ?? null,
    timestamp: new Date().toISOString(),
    requestId: input.requestId ?? newRequestId(),
    metadataJson: input.metadata ?? {},
  });
}
