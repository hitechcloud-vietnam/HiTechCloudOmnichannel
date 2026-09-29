import {
  createSelectSchema,
  integrationMessengerModel,
} from "@hitechcloud.vn/database/schema"
import { zodBigintAsString } from "@hitechcloud.vn/utils"
import type { z } from "zod"

export const integrationMessengerResource = createSelectSchema(
  integrationMessengerModel,
  {
    id: zodBigintAsString(),
    inboxId: zodBigintAsString(),
  },
).pick({
  id: true,
  name: true,
  inboxId: true,
})

export type IntegrationMessengerResource = z.infer<
  typeof integrationMessengerResource
>
