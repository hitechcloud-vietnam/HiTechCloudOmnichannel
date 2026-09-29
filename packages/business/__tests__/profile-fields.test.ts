import { genderTypes } from "@hitechcloud.vn/database/partials"
import { normalizeGender } from "@hitechcloud.vn/sdk"
import { describe, expect, test } from "vitest"

describe("profile field normalization", () => {
  test("gender allowlist matches database enum values", () => {
    for (const gender of genderTypes.options) {
      expect(normalizeGender(gender)).toBe(gender)
    }
  })
})
