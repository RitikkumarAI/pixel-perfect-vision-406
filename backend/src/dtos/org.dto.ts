import { z } from "zod";

export const createOrgSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Organization name is required"),
    domain: z.string().optional(),
  }),
});

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Team name is required"),
    description: z.string().optional(),
  }),
});

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Workspace name is required"),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["OWNER", "ADMIN", "MEMBER", "GUEST"]).default("MEMBER"),
    teamId: z.string().optional(),
  }),
});
