import { OnboardingSteps } from './OnboardingSteps'
import { OnboardingShell } from './OnboardingShell'

export function OnboardingPage({ requireSignIn = false }: { requireSignIn?: boolean }) {
  return (
    <OnboardingShell>
      <OnboardingSteps requireSignIn={requireSignIn} />
    </OnboardingShell>
  )
}
