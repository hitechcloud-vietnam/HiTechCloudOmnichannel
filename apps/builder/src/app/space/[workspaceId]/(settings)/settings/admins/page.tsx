import {
  quotaEnforcementService,
  workspaceService,
} from "@hitechcloud.vn/business"
import { buttonVariants } from "@hitechcloud.vn/ui/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hitechcloud.vn/ui/components/ui/card"
import { getIdFromParams } from "@hitechcloud.vn/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { isCommunity } from "@/env"
import { listWorkspaceMembers } from "@/features/workspace-members/queries"
import { getWorkspaceMembersSearchParamsCache } from "@/features/workspace-members/schema/query"
import { WorkspaceMembersTable } from "@/features/workspace-members/workspace-members-table"
import { assertCurrentUserCanAccessChatbot } from "@/lib/auth/utils"

export default async function SettingsAdminPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const workspaceId = getIdFromParams(await params, "workspaceId")
  if (!workspaceId) {
    return notFound()
  }

  const t = await getTranslations()

  await assertCurrentUserCanAccessChatbot(workspaceId)

  const promises = Promise.all([
    listWorkspaceMembers({
      workspaceId,
      ...getWorkspaceMembersSearchParamsCache.parse({}),
    }),
  ])

  const workspace = await workspaceService.findById({ id: workspaceId })
  const teamMembersAtLimit = await quotaEnforcementService.hasReachedLimit({
    userId: workspace.ownerId,
    metric: "teamMembers",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">{t("admins.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <WorkspaceMembersTable
          promises={promises}
          teamMembersAtLimit={teamMembersAtLimit}
        />
        {!isCommunity() && (
          <div className="mt-6 flex justify-center">
            <Link
              className={buttonVariants({ size: "sm", variant: "outline" })}
              href={`/space/${workspaceId}/audit-logs`}
            >
              {t("admins.adminActivityLogs")}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
