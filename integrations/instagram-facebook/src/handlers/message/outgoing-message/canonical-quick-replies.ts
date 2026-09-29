import {
  getCanonicalReplyPayload,
  type MessageButtonTemplate,
} from "@hitechcloud.vn/sdk"
import type { InstagramQuickReply } from "../../../schema"

export function convertCanonicalQuickReplies(
  buttons: MessageButtonTemplate[],
): InstagramQuickReply[] {
  return buttons.map((button) => ({
    content_type: "text",
    title: button.label,
    payload: getCanonicalReplyPayload(button),
  }))
}
