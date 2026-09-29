import {
  createSelectSchema,
  integrationWhatsappModel,
} from "@hitechcloud.vn/database/schema"
import { zodBigintAsString } from "@hitechcloud.vn/utils"
import { z } from "zod"

export const integrationWhatsappResource = createSelectSchema(
  integrationWhatsappModel,
  {
    id: zodBigintAsString(),
    inboxId: zodBigintAsString(),
  },
).pick({
  id: true,
  name: true,
  inboxId: true,
  displayPhoneNumber: true,
  tokenRefreshError: true,
  phoneNumberId: true,
  wabaId: true,
  hasCapiScope: true,
  capiScopeCheckedAt: true,
  datasetId: true,
})

export type IntegrationWhatsappResource = z.infer<
  typeof integrationWhatsappResource
>

export const listIntegrationWhatsappsResponse = z.array(
  integrationWhatsappResource,
)
export type ListIntegrationWhatsappResponse = z.infer<
  typeof listIntegrationWhatsappsResponse
>
