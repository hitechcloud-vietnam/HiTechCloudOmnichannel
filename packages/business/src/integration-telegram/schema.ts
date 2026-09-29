import {
  createSelectSchema,
  integrationTelegramModel,
} from "@hitechcloud.vn/database/schema"
import { zodBigintAsString } from "@hitechcloud.vn/utils"
import type { z } from "zod"

export const integrationTelegramResource = createSelectSchema(
  integrationTelegramModel,
  {
    id: zodBigintAsString(),
    inboxId: zodBigintAsString(),
    workspaceId: zodBigintAsString(),
  },
)

export type IntegrationTelegramResource = z.infer<
  typeof integrationTelegramResource
>
