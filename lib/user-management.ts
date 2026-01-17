import { db } from "@/lib/db";

export interface TransferOwnershipResult {
  success: boolean;
  transferredClients: number;
  transferredProjects: number;
  message: string;
}

/**
 * Deactivate a user and transfer their clients to another user
 * This is used when a Sales user is deactivated to prevent orphaned records
 *
 * @param userId - The ID of the user to deactivate
 * @param transferToUserId - The ID of the user to transfer ownership to (must be ADMIN)
 * @param deactivatedByUserId - The ID of the user performing the deactivation
 * @returns TransferOwnershipResult
 */
export async function deactivateUserAndTransfer(
  userId: string,
  transferToUserId: string,
  deactivatedByUserId: string
): Promise<TransferOwnershipResult> {
  try {
    // 1. Validate that the user exists and is active
    const userToDeactivate = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            Client: true,
          },
        },
      },
    });

    if (!userToDeactivate) {
      throw new Error("User not found");
    }

    if (!userToDeactivate.isActive) {
      throw new Error("User is already deactivated");
    }

    // 2. Validate that the transfer target exists and is an admin
    const transferToUser = await db.user.findUnique({
      where: { id: transferToUserId },
    });

    if (!transferToUser) {
      throw new Error("Transfer target user not found");
    }

    if (transferToUser.role !== "ADMIN") {
      throw new Error("Can only transfer ownership to Admin users");
    }

    if (!transferToUser.isActive) {
      throw new Error("Transfer target user is not active");
    }

    // 3. Count clients to be transferred
    const clientsCount = await db.client.count({
      where: {
        createdBy: userId,
        deletedAt: null, // Only transfer non-deleted clients
      },
    });

    // 4. Count projects associated with those clients
    const projectsCount = await db.project.count({
      where: {
        client: {
          createdBy: userId,
          deletedAt: null,
        },
      },
    });

    // 5. Use a transaction to ensure atomicity
    await db.$transaction(async (tx) => {
      // Transfer all non-deleted clients to new owner
      await tx.client.updateMany({
        where: {
          createdBy: userId,
          deletedAt: null,
        },
        data: {
          createdBy: transferToUserId,
          transferredFrom: userId,
          transferredAt: new Date(),
        },
      });

      // Deactivate the user
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: false,
        },
      });

      // Log the deactivation activity
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: deactivatedByUserId,
          entityType: "user",
          entityId: userId,
          action: "deactivated",
          changes: {
            transferredTo: transferToUserId,
            clientsTransferred: clientsCount,
            projectsTransferred: projectsCount,
          },
        },
      });

      // Log the ownership transfer
      if (clientsCount > 0) {
        await tx.activityLog.create({
          data: {
            id: crypto.randomUUID(),
            userId: deactivatedByUserId,
            entityType: "client",
            entityId: userId, // Using userId as the entity ID for bulk transfer
            action: "ownership_transferred",
            changes: {
              from: userId,
              to: transferToUserId,
              count: clientsCount,
              reason: "user_deactivation",
            },
          },
        });
      }
    });

    return {
      success: true,
      transferredClients: clientsCount,
      transferredProjects: projectsCount,
      message: `Successfully deactivated user and transferred ${clientsCount} client(s) and ${projectsCount} associated project(s) to ${transferToUser.name || transferToUser.email}`,
    };
  } catch (error) {
    console.error("Error deactivating user and transferring ownership:", error);
    throw error;
  }
}

/**
 * Get a list of active Admin users who can receive transferred ownership
 *
 * @param excludeUserId - Optional user ID to exclude from the list
 * @returns Array of admin users
 */
export async function getAvailableAdmins(
  excludeUserId?: string
): Promise<Array<{ id: string; name: string | null; email: string }>> {
  const admins = await db.user.findMany({
    where: {
      role: "ADMIN",
      isActive: true,
      ...(excludeUserId && { id: { not: excludeUserId } }),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return admins;
}

/**
 * Get statistics about a user's ownership
 * Used to show how many records will be transferred when deactivating
 *
 * @param userId - The user ID
 * @returns Ownership statistics
 */
export async function getUserOwnershipStats(userId: string): Promise<{
  clients: number;
  activeClients: number;
  projects: number;
  activeProjects: number;
}> {
  const [clients, activeClients, projects, activeProjects] = await Promise.all([
    db.client.count({
      where: {
        createdBy: userId,
        deletedAt: null,
      },
    }),
    db.client.count({
      where: {
        createdBy: userId,
        deletedAt: null,
        isActive: true,
      },
    }),
    db.project.count({
      where: {
        client: {
          createdBy: userId,
          deletedAt: null,
        },
      },
    }),
    db.project.count({
      where: {
        status: "ACTIVE",
        client: {
          createdBy: userId,
          deletedAt: null,
        },
      },
    }),
  ]);

  return {
    clients,
    activeClients,
    projects,
    activeProjects,
  };
}

/**
 * Reactivate a previously deactivated user
 * Note: This does NOT transfer ownership back automatically
 *
 * @param userId - The user ID to reactivate
 * @param reactivatedByUserId - The ID of the admin performing the reactivation
 * @returns Success status
 */
export async function reactivateUser(
  userId: string,
  reactivatedByUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isActive) {
      throw new Error("User is already active");
    }

    await db.$transaction(async (tx) => {
      // Reactivate the user
      await tx.user.update({
        where: { id: userId },
        data: {
          isActive: true,
        },
      });

      // Log the reactivation
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: reactivatedByUserId,
          entityType: "user",
          entityId: userId,
          action: "reactivated",
          changes: {},
        },
      });
    });

    return {
      success: true,
      message: `Successfully reactivated user ${user.name || user.email}`,
    };
  } catch (error) {
    console.error("Error reactivating user:", error);
    throw error;
  }
}
