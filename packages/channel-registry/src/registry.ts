import {
  buildContext,
  type IntegrationContext,
  inboxService,
  integrationThreadsService,
  workspaceService,
} from "@hitechcloud.vn/business"
import { findOrFail } from "@hitechcloud.vn/database/client"
import type { IntegrationType } from "@hitechcloud.vn/database/partials"
import { integrationLookupRepository } from "@hitechcloud.vn/database/repositories"
import { inboxModel } from "@hitechcloud.vn/database/schema"
import type {
  ContactInboxModel,
  InboxModel,
  WorkspaceModel,
} from "@hitechcloud.vn/database/types"
import { integration as integrationActiveCampaign } from "@hitechcloud.vn/integration-active-campaign"
import { integration as integrationApi } from "@hitechcloud.vn/integration-api"
import { integration as integrationChatbotx } from "@hitechcloud.vn/integration-hitechcloudomnichannel"
import { integration as integrationDrip } from "@hitechcloud.vn/integration-drip"
import { integration as integrationFacebookAds } from "@hitechcloud.vn/integration-facebook-ads"
import { integration as integrationGetResponse } from "@hitechcloud.vn/integration-get-response"
import { integration as integrationGoogleCalendar } from "@hitechcloud.vn/integration-google-calendar"
import { integration as integrationGoogleSheets } from "@hitechcloud.vn/integration-google-sheets"
import { integration as integrationInstagram } from "@hitechcloud.vn/integration-instagram"
import { integration as integrationInstagramFacebook } from "@hitechcloud.vn/integration-instagram-facebook"
import { integration as integrationKlaviyo } from "@hitechcloud.vn/integration-klaviyo"
import { integration as integrationMailchimp } from "@hitechcloud.vn/integration-mailchimp"
import { integration as integrationMailerLite } from "@hitechcloud.vn/integration-mailer-lite"
import { integration as integrationMessenger } from "@hitechcloud.vn/integration-messenger"
import { integration as integrationMoosend } from "@hitechcloud.vn/integration-moosend"
import { integration as integrationSendGrid } from "@hitechcloud.vn/integration-sendgrid"
import { integration as integrationSmtp } from "@hitechcloud.vn/integration-smtp"
import { integration as integrationTelegram } from "@hitechcloud.vn/integration-telegram"
import { integration as integrationThreads } from "@hitechcloud.vn/integration-threads"
import { integration as integrationTiktok } from "@hitechcloud.vn/integration-tiktok"
import { integration as integrationWebchat } from "@hitechcloud.vn/integration-webchat"
import { integration as integrationWhatsapp } from "@hitechcloud.vn/integration-whatsapp"
import { integration as integrationZalo } from "@hitechcloud.vn/integration-zalo"
import {
  type AuthValue,
  type BaseConfig,
  ChannelError,
  ChannelErrorCategory,
  type Integration,
  type IntegrationDefinition,
  SdkException,
} from "@hitechcloud.vn/sdk"
import { IntegrationNotFoundError } from "./errors"

export { IntegrationNotFoundError } from "./errors"

export const integrations = {
  activeCampaign: integrationActiveCampaign,
  api: integrationApi,
  hitechcloudomnichannel: integrationChatbotx,
  drip: integrationDrip,
  facebookAds: integrationFacebookAds,
  getResponse: integrationGetResponse,
  googleCalendar: integrationGoogleCalendar,
  googleSheets: integrationGoogleSheets,
  instagram: integrationInstagram,
  instagramFacebook: integrationInstagramFacebook,
  klaviyo: integrationKlaviyo,
  mailchimp: integrationMailchimp,
  mailerLite: integrationMailerLite,
  messenger: integrationMessenger,
  moosend: integrationMoosend,
  sendGrid: integrationSendGrid,
  smtp: integrationSmtp,
  telegram: integrationTelegram,
  threads: integrationThreads,
  tiktok: integrationTiktok,
  webchat: integrationWebchat,
  whatsapp: integrationWhatsapp,
  zalo: integrationZalo,
} as const

export type IntegrationKey = keyof typeof integrations

export type ResolvedIntegration = Integration<
  IntegrationDefinition<BaseConfig, AuthValue>
>

const registeredIntegrations = {
  ...integrations,
  gemini: undefined,
  openai: undefined,
}

export const allIntegrations = registeredIntegrations as unknown as Record<
  string,
  ResolvedIntegration | undefined
> &
  Pick<typeof registeredIntegrations, "messenger" | "threads">

export const getRegisteredIntegration = (
  integrationType: string,
): ResolvedIntegration | undefined => allIntegrations[integrationType]

export type IntegrationRow = {
  id: string
  auth: AuthValue
  inboxId: string
  type?: string
  [key: string]: unknown
}

export function isInstagramViaFacebook(row: IntegrationRow): boolean {
  return row.type === "facebook"
}

export const integrationService = {
  identifyInboxAndIntegrationAuthFromIdentifier: async (
    integrationType: IntegrationType,
    integrationIdentifier: string,
  ): Promise<{
    workspace: WorkspaceModel
    inbox: InboxModel
    integrationRow: IntegrationRow
  }> => {
    if (integrationType === "threads") {
      const integrationRow =
        await integrationThreadsService.findByThreadsUserId(
          integrationIdentifier,
        )

      if (!integrationRow) {
        throw new IntegrationNotFoundError(
          integrationType,
          integrationIdentifier,
        )
      }

      const [workspace, inbox] = await Promise.all([
        workspaceService.findById({ id: integrationRow.workspaceId }),
        inboxService.find({ where: { id: integrationRow.inboxId } }),
      ])

      if (!inbox) {
        throw new IntegrationNotFoundError(
          integrationType,
          integrationIdentifier,
        )
      }

      return {
        integrationRow: {
          ...integrationRow,
          auth: integrationRow.auth as AuthValue,
        },
        workspace,
        inbox,
      }
    }

    let modelName: string
    let columnName: string

    switch (integrationType) {
      case "whatsapp": {
        modelName = "IntegrationWhatsapp"
        columnName = "phoneNumberId"
        break
      }
      case "telegram": {
        modelName = "IntegrationTelegram"
        columnName = "botId"
        break
      }
      case "messenger": {
        modelName = "IntegrationMessenger"
        columnName = "pageId"
        break
      }
      case "zalo": {
        modelName = "IntegrationZalo"
        columnName = "oaId"
        break
      }
      case "instagram":
      case "instagramFacebook": {
        modelName = "IntegrationInstagram"
        columnName = "igId"
        break
      }
      case "tiktok": {
        modelName = "IntegrationTiktok"
        columnName = "openId"
        break
      }
      case "webchat": {
        modelName = "IntegrationWebchat"
        columnName = "inboxId"
        break
      }
      case "api": {
        modelName = "IntegrationApi"
        columnName = "inboxId"
        break
      }
      default:
        throw new Error(`Unsupported integration: ${integrationType}`)
    }

    const row = await integrationLookupRepository.findAuthByIdentifier({
      modelName,
      columnName,
      identifier: integrationIdentifier,
    })

    if (!row) {
      throw new IntegrationNotFoundError(integrationType, integrationIdentifier)
    }

    const integrationRow = row as IntegrationRow & { workspaceId: string }
    const workspace = await workspaceService.findById({
      id: integrationRow.workspaceId,
    })
    const inbox = await findOrFail({
      table: inboxModel,
      where: { id: integrationRow.inboxId },
      message: "Inbox not found",
    })

    return { integrationRow, workspace, inbox }
  },

  getIntegrationFromContactInbox: async (
    contactInbox: ContactInboxModel,
  ): Promise<IntegrationRow> => {
    if (contactInbox.channel === "threads") {
      const integrationRow = await integrationThreadsService.findByInboxId(
        contactInbox.inboxId,
      )

      if (!integrationRow) {
        throw new ChannelError(
          `Unable to find integration auth for channel: ${contactInbox.channel}`,
          ChannelErrorCategory.AUTH_FAILED,
          { code: "integration_auth_missing" },
        )
      }

      return {
        ...integrationRow,
        auth: integrationRow.auth as AuthValue,
      }
    }

    const integrationTableByChannel: Partial<Record<string, string>> = {
      api: "IntegrationApi",
      instagram: "IntegrationInstagram",
      messenger: "IntegrationMessenger",
      smtp: "IntegrationSmtp",
      telegram: "IntegrationTelegram",
      tiktok: "IntegrationTiktok",
      webchat: "IntegrationWebchat",
      whatsapp: "IntegrationWhatsapp",
      zalo: "IntegrationZalo",
    }
    const integrationTable = integrationTableByChannel[contactInbox.channel]
    if (!integrationTable) {
      throw new ChannelError(
        `Unsupported integration channel: ${contactInbox.channel}`,
        ChannelErrorCategory.AUTH_FAILED,
        { code: "unsupported_channel" },
      )
    }

    const row = await integrationLookupRepository.findAuthByInboxId({
      modelName: integrationTable,
      inboxId: contactInbox.inboxId,
    })

    if (!row) {
      throw new ChannelError(
        `Unable to find integration auth for channel: ${contactInbox.channel}`,
        ChannelErrorCategory.AUTH_FAILED,
        { code: "integration_auth_missing" },
      )
    }

    return row as IntegrationRow
  },
}

export type ResolvedIntegrationContext = {
  integration: ResolvedIntegration
  ctx: IntegrationContext
  integrationRow: Awaited<
    ReturnType<typeof integrationService.getIntegrationFromContactInbox>
  >
}

export async function resolveIntegrationContextFromContactInbox(args: {
  workspaceId: string
  contactInbox: ContactInboxModel
}): Promise<ResolvedIntegrationContext> {
  let integration = getRegisteredIntegration(args.contactInbox.channel)
  if (!integration) {
    throw new SdkException(
      `No integration registered for channel: ${args.contactInbox.channel}`,
    )
  }

  const integrationRow =
    await integrationService.getIntegrationFromContactInbox(args.contactInbox)

  if (
    args.contactInbox.channel === "instagram" &&
    isInstagramViaFacebook(integrationRow)
  ) {
    integration = getRegisteredIntegration("instagramFacebook") ?? integration
  }

  return {
    integration,
    integrationRow,
    ctx: await buildContext({
      workspaceId: args.workspaceId,
      integrationType: args.contactInbox.channel,
      integration: integrationRow,
    }),
  }
}
