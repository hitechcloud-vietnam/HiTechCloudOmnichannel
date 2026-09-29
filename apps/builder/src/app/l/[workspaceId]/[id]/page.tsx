import {
  inboxService,
  qrCodeService,
  resolveTenantSettings,
} from "@hitechcloud.vn/business"
import { getInboxLinks } from "@hitechcloud.vn/business/utils"
import type { InboxWithIntegrations } from "@hitechcloud.vn/database/types"
import { getIdFromParams } from "@hitechcloud.vn/utils"
import { notFound, redirect } from "next/navigation"
import { InboxListLandingPage } from "@/features/inboxes/components/landing-inbox-list"
import { maxPerPage } from "@/lib/shared-request"
import { loadServableWorkspace } from "@/lib/workspace/load-servable-workspace"

export default async function LandingPage({
  params,
}: {
  params: Promise<{ workspaceId: string; id: string }>
}) {
  const resolvedParams = await params
  const workspaceId = getIdFromParams(resolvedParams, "workspaceId")
  const id = getIdFromParams(resolvedParams, "id")

  if (!(workspaceId && id)) {
    return notFound()
  }

  const { servable } = await loadServableWorkspace(workspaceId)
  if (!servable) {
    return notFound()
  }

  const { appUrl } = await resolveTenantSettings({
    workspaceId,
  })
  const qrCode = await qrCodeService.find({ workspaceId, id })
  if (!qrCode) {
    return notFound()
  }

  const { data: inboxes } = await inboxService.list({
    workspaceId,
    includes: ["integration"],
    perPage: maxPerPage,
  })
  const refConfig = { type: "reflink" as const, name: qrCode.name }
  const inboxLinks = getInboxLinks(
    appUrl,
    inboxes as InboxWithIntegrations[],
    refConfig,
  )

  if (inboxLinks.length === 0) {
    return notFound()
  }

  if (inboxLinks.length === 1) {
    redirect(inboxLinks[0].url)
  }

  return <InboxListLandingPage inboxLinks={inboxLinks} />
}
