import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@hitechcloud.vn/ui/components/ui/card"
import { getIdFromParams } from "@hitechcloud.vn/utils"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { UserPersistentMenuForm } from "@/features/user-persistent-menus/components/user-persistent-menu-form"

export default async function CreateUserPersistentMenuPage(props: {
  params: Promise<{ workspaceId: string }>
}) {
  const workspaceId = getIdFromParams(await props.params, "workspaceId")
  if (!workspaceId) {
    return notFound()
  }

  const t = await getTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-xl">
          {t("actions.createFeature", {
            feature: t("fields.userPersistentMenu.label"),
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserPersistentMenuForm workspaceId={workspaceId} />
      </CardContent>
    </Card>
  )
}
