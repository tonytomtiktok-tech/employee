import { z } from "zod";

export const formQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "rating",
    "single_select",
    "multi_select",
    "textarea",
    "number",
    "date",
  ]),
  label: z.string().min(1),
  required: z.boolean(),
  min: z.number().optional(),
  max: z.number().optional(),
  weight: z.number().positive().optional(),
  dimension: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  options: z.array(z.string()).optional(),
});

export const formSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  questions: z.array(formQuestionSchema).min(1),
});

export const formSchemaSchema = z.object({
  formId: z.string().min(1),
  version: z.number().int().positive(),
  stage: z.enum(["SELF", "MANAGER", "COMMITTEE"]),
  title: z.string().min(1),
  sections: z.array(formSectionSchema).min(1),
});

export const scoringConfigSchema = z.object({
  method: z.literal("weighted_mean"),
  missingRequiredBlocksSubmit: z.boolean(),
  notApplicablePolicy: z.literal("exclude"),
});

export const draftAnswersSchema = z.record(z.string(), z.unknown());

export const submitBodySchema = z.object({
  stage: z.enum(["SELF", "MANAGER", "COMMITTEE"]),
  answers: draftAnswersSchema,
  idempotencyKey: z.string().min(8),
  expectedVersion: z.number().int().nonnegative(),
});

export const draftBodySchema = z.object({
  stage: z.enum(["SELF", "MANAGER", "COMMITTEE"]),
  answers: draftAnswersSchema,
  expectedVersion: z.number().int().nonnegative(),
});

export const finalizeBodySchema = z.object({
  answers: draftAnswersSchema,
  decisionNote: z.string().min(1).max(5000),
  conflictDeclared: z.boolean().default(false),
  idempotencyKey: z.string().min(8),
  expectedVersion: z.number().int().nonnegative(),
  performanceScore: z.number().min(1).max(5).optional(),
  potentialScore: z.number().min(1).max(5).optional(),
});
