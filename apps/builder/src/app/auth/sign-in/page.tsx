import { SOCIAL_PROVIDERS } from "@hitechcloud.vn/auth/server"
import { SignInForm } from "@/features/auth/sign-in"
import { resolveEnabledProvidersForDomain } from "@/lib/auth/auth-instances"
import { getDomainFromHeader } from "@/lib/domain"

export const dynamic = "force-dynamic"

export default async function SignInPage() {
  const enabledProviders = await resolveEnabledProvidersForDomain(
    await getDomainFromHeader(),
    SOCIAL_PROVIDERS,
  )
  return <SignInForm enabledProviders={enabledProviders} />
}
