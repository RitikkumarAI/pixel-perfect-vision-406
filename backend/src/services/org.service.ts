import prisma from "../utils/prisma";
import { Role } from "@prisma/client";

export class OrgService {
  public async createOrganization(userId: string, name: string, domain?: string) {
    const org = await prisma.organization.create({
      data: {
        name,
        domain,
        memberships: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    // Create a default team and workspace for the new org
    const team = await prisma.team.create({
      data: {
        organizationId: org.id,
        name: "General",
        members: {
          connect: { id: org.memberships[0]!.id },
        },
      },
    });

    await prisma.workspace.create({
      data: {
        teamId: team.id,
        name: "Main Workspace",
      },
    });

    return org;
  }

  public async getUserOrganizations(userId: string) {
    return prisma.organization.findMany({
      where: {
        memberships: {
          some: { userId },
        },
        deletedAt: null,
      },
      include: {
        teams: {
          include: {
            workspaces: true,
          },
        },
      },
    });
  }

  public async createTeam(userId: string, orgId: string, name: string, description?: string) {
    // Verify membership and admin/owner role
    const membership = await prisma.membership.findFirst({
      where: { userId, organizationId: orgId, role: { in: [Role.OWNER, Role.ADMIN] } },
    });

    if (!membership) throw new Error("Unauthorized to create teams in this organization");

    return prisma.team.create({
      data: {
        organizationId: orgId,
        name,
        description,
        members: {
          connect: { id: membership.id },
        },
      },
    });
  }

  public async createWorkspace(userId: string, teamId: string, name: string) {
    // Verify team membership
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) throw new Error("Team not found");

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) throw new Error("Unauthorized to create workspaces in this team");

    return prisma.workspace.create({
      data: {
        teamId,
        name,
      },
    });
  }

  public async inviteMember(
    inviterId: string,
    orgId: string,
    email: string,
    role: Role,
    teamId?: string,
  ) {
    const inviterMembership = await prisma.membership.findFirst({
      where: { userId: inviterId, organizationId: orgId, role: { in: [Role.OWNER, Role.ADMIN] } },
    });

    if (!inviterMembership) throw new Error("Unauthorized to invite members");

    const userToInvite = await prisma.user.findUnique({ where: { email } });
    if (!userToInvite) {
      // In a real system, send an email to sign up.
      // For this MVP backend, we mock it by throwing an error or creating a placeholder.
      throw new Error("User not found. They must register first.");
    }

    const existingMembership = await prisma.membership.findFirst({
      where: { userId: userToInvite.id, organizationId: orgId },
    });

    if (existingMembership) {
      // Update role or add to team if already member
      return prisma.membership.update({
        where: { id: existingMembership.id },
        data: {
          role: role,
          teamId: teamId || existingMembership.teamId,
        },
      });
    }

    return prisma.membership.create({
      data: {
        userId: userToInvite.id,
        organizationId: orgId,
        role,
        teamId,
      },
    });
  }
}
