import prisma from './prisma.js';
export const createAuditLog = async (userId, action, entityType, entityId, metadata) => {
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
    }
    catch (error) {
        console.error('Failed to write audit log:', error);
    }
};
