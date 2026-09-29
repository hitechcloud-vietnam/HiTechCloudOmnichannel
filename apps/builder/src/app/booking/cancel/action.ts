"use server"

import { appointmentService } from "@hitechcloud.vn/business"
import { verifyAppointmentCancelToken } from "@hitechcloud.vn/encryption"
import { cancelBookingRequestSchema } from "@/features/booking-webview/schema/action"
import { actionClient } from "@/lib/safe-action"

export const cancelBookingAction = actionClient
  .inputSchema(cancelBookingRequestSchema)
  .action(async ({ parsedInput }) => {
    const tokenPayload = await verifyAppointmentCancelToken(parsedInput.token)
    return await appointmentService.cancelAppointmentByToken(tokenPayload)
  })
