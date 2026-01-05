/**
 * Phone Lookup Activities for Temporal Workflow
 * Each provider call is wrapped as a Temporal activity with its own retry and timeout handling.
 */

import {
    OrionConnectInput,
    AstraDialerInput,
    NimbusLookupInput,
    lookupOrionConnect,
    lookupAstraDialer,
    lookupNimbusLookup,
} from '../../providers/phoneProvider'

/**
 * Activity: Look up phone using Orion Connect
 * Best data quality, but slower and can fail
 */
export async function lookupPhoneOrionConnect(lead: OrionConnectInput): Promise<string | null> {
    console.log(`[OrionConnect] Looking up phone for ${lead.firstName} ${lead.lastName}`)
    try {
        const phone = await lookupOrionConnect(lead)
        console.log(`[OrionConnect] Result: ${phone || 'not found'}`)
        return phone
    } catch (error) {
        console.error(`[OrionConnect] Error:`, error)
        throw error
    }
}

/**
 * Activity: Look up phone using Astra Dialer
 * Fastest provider, but lower data quality
 */
export async function lookupPhoneAstraDialer(input: AstraDialerInput): Promise<string | null> {
    console.log(`[AstraDialer] Looking up phone for ${input.email}`)
    try {
        const phone = await lookupAstraDialer(input)
        console.log(`[AstraDialer] Result: ${phone || 'not found'}`)
        return phone
    } catch (error) {
        console.error(`[AstraDialer] Error:`, error)
        throw error
    }
}

/**
 * Activity: Look up phone using Nimbus Lookup
 * New provider in the market
 */
export async function lookupPhoneNimbusLookup(input: NimbusLookupInput): Promise<string | null> {
    console.log(`[NimbusLookup] Looking up phone for ${input.email}`)
    try {
        const phone = await lookupNimbusLookup(input)
        console.log(`[NimbusLookup] Result: ${phone || 'not found'}`)
        return phone
    } catch (error) {
        console.error(`[NimbusLookup] Error:`, error)
        throw error
    }
}
