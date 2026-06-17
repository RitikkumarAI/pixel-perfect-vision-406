import prisma from "../utils/prisma";

export class DocumentService {
  public async createDocument(
    workspaceId: string,
    title: string,
    content: any = {},
    isPublic: boolean = false,
  ) {
    return prisma.document.create({
      data: {
        workspaceId,
        title,
        content,
        isPublic,
      },
    });
  }

  public async getWorkspaceDocuments(workspaceId: string) {
    return prisma.document.findMany({
      where: { workspaceId, deletedAt: null },
      select: { id: true, title: true, isPublic: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  public async getDocument(documentId: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.deletedAt) throw new Error("Document not found");
    return doc;
  }

  public async updateDocument(
    documentId: string,
    title?: string,
    content?: any,
    isPublic?: boolean,
  ) {
    // Content here is expected to be TipTap/Yjs JSON CRDT or standard blocks
    return prisma.document.update({
      where: { id: documentId },
      data: {
        title,
        ...(content && { content }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });
  }

  public async deleteDocument(documentId: string) {
    return prisma.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });
  }
}
