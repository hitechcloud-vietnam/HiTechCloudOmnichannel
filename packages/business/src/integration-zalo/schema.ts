import {
  createSelectSchema,
  integrationZaloModel,
} from "@hitechcloud.vn/database/schema"
import { z } from "zod"

export const integrationZaloResource = createSelectSchema(
  integrationZaloModel,
  {
    id: z.string(),
    inboxId: z.string(),
  },
).pick({
  id: true,
  name: true,
})

export type IntegrationZaloResource = z.infer<typeof integrationZaloResource>
