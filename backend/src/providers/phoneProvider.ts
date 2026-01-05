/**
 * Phone Provider Abstraction Layer
 * Provides a unified interface for querying phone numbers from different providers.
 */

interface LeadInput {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string | null
  companyWebsite?: string | null
}

export type OrionConnectInput = Required<Pick<LeadInput, 'firstName' | 'lastName' | 'companyWebsite'>>
export type AstraDialerInput = Required<Pick<LeadInput, 'email'>>
export type NimbusLookupInput = Required<Pick<LeadInput, 'email' | 'jobTitle'>>

export interface PhoneResult {
  phone: string | null
  provider: string
}

/**
 * Orion Connect Provider
 * Best data in the market, but slow and fails sometimes
 * Base URL: https://api.genesy.ai/api/tmp/orionConnect
 * Request: { "fullName": "Ada Lovelace", "companyWebsite": "example.com" }
 * Authentication: Request header 'x-auth-me' with key 'mySecretKey123'
 * Response: { "phone": string | null }
 */
export async function lookupOrionConnect(input: OrionConnectInput): Promise<string | null> {
  const fullName = `${input.firstName} ${input.lastName}`.trim()
  const response = await fetch('https://api.genesy.ai/api/tmp/orionConnect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-me': 'mySecretKey123',
    },
    body: JSON.stringify({ fullName, companyWebsite: input.companyWebsite }),
  })

  if (!response.ok) {
    throw new Error(`Orion Connect API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { phone: string | null }
  return data.phone || null
}

/**
 * Astra Dialer Provider
 * Worst data in the market, but is the fastest one
 * Base URL: https://api.genesy.ai/api/tmp/astraDialer
 * Request: { "email": "john.doe@example.com" }
 * Authentication: Request header 'apiKey' with key '1234jhgf'
 * Response: { "phoneNmbr": string | null | undefined }
 */
export async function lookupAstraDialer(input: AstraDialerInput): Promise<string | null> {
  const response = await fetch('https://api.genesy.ai/api/tmp/astraDialer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiKey: '1234jhgf',
    },
    body: JSON.stringify({ email: input.email }),
  })

  if (!response.ok) {
    throw new Error(`Astra Dialer API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { phoneNmbr?: string | null }
  return data.phoneNmbr || null
}

/**
 * Nimbus Lookup Provider
 * New provider in the market
 * Base URL: https://api.genesy.ai/api/tmp/numbusLookup
 * Request: { "email": "john.doe@example.com", "jobTitle": "CTO" }
 * Authentication: Get parameter 'api' with key '000099998888'
 * Response: { "number": number, "countryCode": "string" }
 */
export async function lookupNimbusLookup(input: NimbusLookupInput): Promise<string | null> {
  const url = new URL('https://api.genesy.ai/api/tmp/numbusLookup')
  url.searchParams.set('api', '000099998888')

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: input.email, jobTitle: input.jobTitle || 'Unknown' }),
  })

  if (!response.ok) {
    throw new Error(`Nimbus Lookup API error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as { number?: number; countryCode?: string }

  if (data.number !== undefined && data.number !== null) {
    const countryCode = data.countryCode || ''
    return `${countryCode}${data.number}`.trim()
  }

  return null
}
