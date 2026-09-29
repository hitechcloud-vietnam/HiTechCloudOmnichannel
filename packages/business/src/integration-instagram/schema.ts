import {
  createSelectSchema,
  integrationInstagramModel,
} from "@hitechcloud.vn/database/schema"
import { zodBigintAsString } from "@hitechcloud.vn/utils"
import type { z } from "zod"

export const integrationInstagramResource = createSelectSchema(
  integrationInstagramModel,
  {
    id: zodBigintAsString(),
    inboxId: zodBigintAsString(),
  },
).pick({
  id: true,
  name: true,
  inboxId: true,
  username: true,
})

export type IntegrationInstagramResource = z.infer<
  typeof integrationInstagramResource
>
