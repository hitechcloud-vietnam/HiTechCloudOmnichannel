import { db, eq, isDatabaseError } from "@hitechcloud.vn/database/client"
import {
  integrationModel,
  integrationMoosendModel,
} from "@hitechcloud.vn/database/schema"
import { encryptUtils } from "@hitechcloud.vn/encryption"
import type { AuthValue } from "@hitechcloud.vn/sdk"
import { createId } from "@hitechcloud.vn/utils"
import { BaseService } from "../base.service"

const WORKSPACE_UNIQUE_CONSTRAINT = "IntegrationMoosend_workspaceId_key"

const isWorkspaceUniqueViolation = (error: unknown): boolean =>
  isDatabaseError(error) &&
  error.cause.code === "23505" &&
  "constraint" in error.cause &&
  error.cause.constraint === WORKSPACE_UNIQUE_CONSTRAINT

class IntegrationMoosendService extends BaseService {
  findByWorkspaceId(workspaceId: string) {
    return db.query.integrationMoosendModel.findFirst({
      where: { workspaceId },
    })
  }

  async findByWorkspaceIdOrFail(workspaceId: string) {
    const integration = await this.findByWorkspaceId(workspaceId)
    if (!integration) {
      throw new Error("Moosend integration not found")
    }
    return integration
  }

  async upsert(props: { workspaceId: string; auth: AuthValue }) {
    const encryptedAuth = await encryptUtils.encryptObject(props.auth)

    const updateExisting = async () => {
      const [updated] = await db
        .update(integrationMoosendModel)
        .set({ auth: encryptedAuth })
        .where(eq(integrationMoosendModel.workspaceId, props.workspaceId))
        .returning({ id: integrationMoosendModel.id })
      return updated?.id
    }

    const existingId = await updateExisting()
    if (existingId) {
      await this.audit(
        "update",
        "updated the Moosend integration configuration",
      )
      return existingId
    }

    const integrationId = createId()
    const moosendId = createId()
    try {
      await db.transaction(async (tx) => {
        await tx.insert(integrationModel).values({
          id: integrationId,
          workspaceId: props.workspaceId,
          integrationType: "moosend",
        })
        await tx.insert(integrationMoosendModel).values({
          id: moosendId,
          workspaceId: props.workspaceId,
          integrationId,
          auth: encryptedAuth,
        })
      })
      await this.audit("connect", "connected a new Moosend integration")
      return moosendId
    } catch (error) {
      if (!isWorkspaceUniqueViolation(error)) {
        throw error
      }
      const winnerId = await updateExisting()
      if (!winnerId) {
        throw error
      }
      await this.audit(
        "update",
        "updated the Moosend integration configuration",
      )
      return winnerId
    }
  }

  async disconnect(workspaceId: string) {
    const existing = await this.findByWorkspaceId(workspaceId)
    if (!existing) {
      return
    }
    await db.transaction(async (tx) => {
      await tx
        .delete(integrationMoosendModel)
        .where(eq(integrationMoosendModel.id, existing.id))
      await tx
        .delete(integrationModel)
        .where(eq(integrationModel.id, existing.integrationId))
    })

    await this.audit("disconnect", "disconnected the Moosend integration")
  }
}

export const integrationMoosendService = new IntegrationMoosendService()
