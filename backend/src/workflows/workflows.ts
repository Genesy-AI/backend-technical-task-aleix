import { proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'

const { verifyEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 second',
})

/**
 * Phone lookup activities
 * Each provider has its own activity with appropriate timeout and retry
 */
const { lookupPhoneOrionConnect, lookupPhoneAstraDialer, lookupPhoneNimbusLookup } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '5 seconds',
    retry: {
      maximumAttempts: 3,
      backoffCoefficient: 2,
      initialInterval: '1s',
    },
  })

export async function verifyEmailWorkflow(email: string): Promise<boolean> {
  return await verifyEmail(email)
}

export interface PhoneWaterfallInput {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string | null
  companyName?: string | null
  companyWebsite?: string | null
}

export interface PhoneWaterfallResult {
  phone: string | null
  provider: string | null
  status: 'found' | 'not_found' | 'error'
  error?: string
}

/**
 * Phone Waterfall Workflow
 * Queries three phone providers in sequence until a phone number is found.
 * Order: Orion Connect (best quality) → Astra Dialer (fastest) → Nimbus Lookup (new)
 *
 * This workflow is idempotent - using workflowId: `enrich-phone-${leadId}` ensures
 * only one workflow runs per lead at a time.
 */
export async function phoneWaterfallWorkflow(input: PhoneWaterfallInput): Promise<PhoneWaterfallResult> {
  // Provider 1: Orion Connect (best data, but slow)
  try {
    let companyWebsite = input.companyWebsite;
    if (!companyWebsite) { // Fallback to companyName if companyWebsite is not provided
      companyWebsite = input.companyName ? input.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : 'unknown.com'
    }
    const phone = await lookupPhoneOrionConnect({
      firstName: input.firstName,
      lastName: input.lastName,
      companyWebsite,
    })

    if (phone) {
      return { phone, provider: 'orion_connect', status: 'found' }
    }
  } catch (error) {
    console.log('[PhoneWaterfall] Orion Connect failed, trying next provider...')
  }

  // Provider 2: Astra Dialer (fastest, but worst data)
  try {
    const phone = await lookupPhoneAstraDialer({ email: input.email })

    if (phone) {
      return { phone, provider: 'astra_dialer', status: 'found' }
    }
  } catch (error) {
    console.log('[PhoneWaterfall] Astra Dialer failed, trying next provider...')
  }

  // Provider 3: Nimbus Lookup (new provider)
  try {
    const phone = await lookupPhoneNimbusLookup({
      email: input.email,
      jobTitle: input.jobTitle || 'Unknown',
    })

    if (phone) {
      return { phone, provider: 'nimbus_lookup', status: 'found' }
    }
  } catch (error) {
    console.log('[PhoneWaterfall] Nimbus Lookup failed')
    return {
      phone: null,
      provider: null,
      status: 'error',
      error: 'All providers failed',
    }
  }

  // No provider found a phone number
  return { phone: null, provider: null, status: 'not_found' }
}
