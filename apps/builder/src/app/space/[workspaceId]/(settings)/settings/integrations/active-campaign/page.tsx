import { integrationActiveCampaignService } from "@hitechcloud.vn/business"
import { getIdFromParams } from "@hitechcloud.vn/utils"
import { notFound } from "next/navigation"
import { ManageActiveCampaign } from "@/features/integration-active-campaign/components/manage-active-campaign"

export default async function SettingIntegrationActiveCampaignPage(props: {
  params: Promise<{ workspaceId: string }>
}) {
  const workspaceId = getIdFromParams(await props.params, "workspaceId")
  if (!workspaceId) {
    return notFound()
  }
  const integration =
    await integrationActiveCampaignService.findByWorkspaceId(workspaceId)
  return (
    <ManageActiveCampaign
      isConnected={Boolean(integration)}
      workspaceId={workspaceId}
    />
  )
}
