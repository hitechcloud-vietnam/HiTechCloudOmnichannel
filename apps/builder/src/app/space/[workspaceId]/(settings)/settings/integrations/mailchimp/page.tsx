import { integrationMailchimpService } from "@hitechcloud.vn/business"
import { getIdFromParams } from "@hitechcloud.vn/utils"
import { notFound } from "next/navigation"
import { ManageMailchimp } from "@/features/integration-mailchimp/components/manage-mailchimp"

export default async function SettingIntegrationMailchimpPage(props: {
  params: Promise<{ workspaceId: string }>
}) {
  const workspaceId = getIdFromParams(await props.params, "workspaceId")
  if (!workspaceId) {
    return notFound()
  }

  const integration =
    await integrationMailchimpService.findByWorkspaceId(workspaceId)

  return (
    <ManageMailchimp
      isConnected={Boolean(integration)}
      workspaceId={workspaceId}
    />
  )
}
