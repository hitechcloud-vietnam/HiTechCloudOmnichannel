import {
  createSelectSchema,
  integrationWebchatModel,
} from "@hitechcloud.vn/database/schema"
import { zodBigintAsString } from "@hitechcloud.vn/utils"
import type { z } from "zod"

export const integrationWebchatResource = createSelectSchema(
  integrationWebchatModel,
  {
    id: zodBigintAsString(),
    inboxId: zodBigintAsString(),
  },
).pick({
  id: true,
  name: true,
})

export type IntegrationWebchatResource = z.infer<
  typeof integrationWebchatResource
>
