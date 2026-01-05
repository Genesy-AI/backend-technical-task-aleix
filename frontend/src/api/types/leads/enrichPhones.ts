export interface LeadsEnrichPhonesInput {
    leadIds: number[]
}

export interface LeadsEnrichPhonesOutput {
    success: boolean
    foundCount: number
    results: Array<{
        leadId: number
        status: string
        phone?: string
        provider?: string
    }>
    errors: Array<{
        leadId: number
        leadName: string
        error: string
    }>
}
