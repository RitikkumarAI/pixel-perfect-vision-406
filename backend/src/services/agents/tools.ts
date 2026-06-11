import prisma from '../../utils/prisma';

export const AgentTools = {
  createTask: async (workspaceId: string, title: string, description: string) => {
    return prisma.task.create({
      data: { workspaceId, title, description, status: "TODO" }
    });
  },
  
  searchDocuments: async (workspaceId: string, query: string) => {
    // In a real implementation, this would use pgvector or full-text search.
    // For MVP, we'll just do an ILIKE query.
    return prisma.document.findMany({
      where: {
        workspaceId,
        title: { contains: query, mode: 'insensitive' }
      },
      take: 5
    });
  },

  getTasks: async (workspaceId: string) => {
    return prisma.task.findMany({
      where: { workspaceId }
    });
  },

  getMeetingNotes: async (meetingId: string) => {
    return prisma.note.findMany({
      where: { meetingId }
    });
  }
};
