import type { Context } from "@hitechcloud.vn/sdk"
import ky, { type KyInstance } from "ky"
import type { ChatbotxAuthValue } from "../auth"

export const getRealtimeClient = (
  ctx: Context<ChatbotxAuthValue>,
): KyInstance =>
  ky.create({
    headers: {
      "X-API-KEY": ctx.auth.apiKey,
    },
    baseUrl: ctx.auth.wsUrl,
  })
