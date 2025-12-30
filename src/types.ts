import { z } from "zod";

// Memory types
export const MemoryTypeEnum = z.enum(["entity", "concept", "session"]);
export type MemoryType = z.infer<typeof MemoryTypeEnum>;

// Memory schema
export const MemorySchema = z.object({
  id: z.string(),
  title: z.string(),
  type: MemoryTypeEnum,
  tags: z.array(z.string()).default([]),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  related: z.array(z.string()).default([]),
  importance: z.number().min(0).max(1).default(0.5),
  content: z.string()
});

export type Memory = z.infer<typeof MemorySchema>;

// Create memory input schema
export const CreateMemorySchema = z.object({
  title: z.string(),
  type: MemoryTypeEnum,
  tags: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  importance: z.number().min(0).max(1).optional(),
  content: z.string()
});

export type CreateMemoryInput = z.infer<typeof CreateMemorySchema>;

// Update memory input schema
export const UpdateMemorySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  importance: z.number().min(0).max(1).optional(),
  content: z.string().optional()
});

export type UpdateMemoryInput = z.infer<typeof UpdateMemorySchema>;

// Search memories input schema
export const SearchMemoriesSchema = z.object({
  query: z.string(),
  types: z.array(MemoryTypeEnum).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().positive().optional()
});

export type SearchMemoriesInput = z.infer<typeof SearchMemoriesSchema>;

// List memories input schema
export const ListMemoriesSchema = z.object({
  types: z.array(MemoryTypeEnum).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().positive().optional()
});

export type ListMemoriesInput = z.infer<typeof ListMemoriesSchema>;

// Tag memory input schema
export const TagMemorySchema = z.object({
  id: z.string(),
  tags: z.array(z.string())
});

export type TagMemoryInput = z.infer<typeof TagMemorySchema>;

// Relate memories input schema
export const RelateMemoriesSchema = z.object({
  sourceId: z.string(),
  targetIds: z.array(z.string())
});

export type RelateMemoriesInput = z.infer<typeof RelateMemoriesSchema>;

// Build memory store input schema
export const BuildMemoryStoreSchema = z.object({
  directory: z.string(),
  overwrite: z.boolean().optional()
});

export type BuildMemoryStoreInput = z.infer<typeof BuildMemoryStoreSchema>;

// Memory metadata schema
export const MetadataSchema = z.object({
  lastUpdated: z.string().datetime(),
  memoryCount: z.number().nonnegative(),
  indexVersion: z.number().nonnegative()
});

export type Metadata = z.infer<typeof MetadataSchema>;

// Search result schema
export const SearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: MemoryTypeEnum,
  tags: z.array(z.string()),
  score: z.number(),
  preview: z.string(),
  created: z.string().datetime(),
  updated: z.string().datetime()
});

export type SearchResult = z.infer<typeof SearchResultSchema>; 