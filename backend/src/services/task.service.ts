import prisma from '../utils/prisma';

export class TaskService {
  public async createTask(workspaceId: string, title: string, description?: string, status: string = 'TODO', priority: string = 'MEDIUM', parentId?: string, assigneeId?: string, dueDate?: Date) {
    return prisma.task.create({
      data: {
        workspaceId,
        title,
        description,
        status,
        priority,
        parentId,
        assigneeId,
        dueDate
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  public async getWorkspaceTasks(workspaceId: string, status?: string) {
    // This allows fetching all tasks or fetching by a specific status column for Kanban
    return prisma.task.findMany({
      where: { 
        workspaceId, 
        deletedAt: null,
        ...(status && { status })
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        subtasks: {
          select: { id: true, title: true, status: true, priority: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  public async updateTask(taskId: string, updates: Partial<{ title: string, description: string, status: string, priority: string, assigneeId: string, dueDate: Date }>) {
    return prisma.task.update({
      where: { id: taskId },
      data: updates,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        subtasks: true
      }
    });
  }

  public async deleteTask(taskId: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() }
    });
  }
}
