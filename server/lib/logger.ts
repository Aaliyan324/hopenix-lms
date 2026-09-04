import prisma from './prisma.js';

export const createAuditLog = async (
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, any> | null
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
