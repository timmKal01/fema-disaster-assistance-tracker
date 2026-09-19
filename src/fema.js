const UA = 'FemaDisasterAssistanceTracker/0.1 (+contact: fema-assistance-tracker-admin@example.com)';
const API_URL = 'https://www.fema.gov/api/open/v1/IndividualAssistanceHousingRegistrantsLargeDisasters';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 20_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`OpenFEMA request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`OpenFEMA request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

function odataString(s) {
    return `'${String(s).replace(/'/g, "''")}'`;
}

function buildFilter({ disasterNumber, state }) {
    const parts = [];
    if (disasterNumber) parts.push(`disasterNumber eq ${disasterNumber}`);
    if (state) parts.push(`damagedStateAbbreviation eq ${odataString(state.toUpperCase())}`);
    return parts.join(' and ');
}

export async function fetchRegistrants({ disasterNumber, state, maxResults }) {
    const filter = buildFilter({ disasterNumber, state });

    const url = new URL(API_URL);
    if (filter) url.searchParams.set('$filter', filter);
    url.searchParams.set('$top', String(Math.min(maxResults, 500)));

    const res = await fetchWithRetry(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    const data = await res.json();
    const rows = data.IndividualAssistanceHousingRegistrantsLargeDisasters ?? [];

    return rows.map((r) => ({
        disasterNumber: r.disasterNumber,
        damagedCity: r.damagedCity,
        damagedStateAbbreviation: r.damagedStateAbbreviation,
        damagedZipCode: r.damagedZipCode,
        residenceType: r.residenceType,
        ownRent: r.ownRent,
        primaryResidence: r.primaryResidence,
        householdComposition: r.householdComposition,
        grossIncome: r.grossIncome,
        specialNeeds: r.specialNeeds,
        homeOwnersInsurance: r.homeOwnersInsurance,
        floodInsurance: r.floodInsurance,
        inspected: r.inspected,
        destroyed: r.destroyed,
        floodDamage: r.floodDamage,
        foundationDamage: r.foundationDamage,
        roofDamage: r.roofDamage,
        rentalAssistanceEligible: r.rentalAssistanceEligible,
        rentalAssistanceAmount: r.rentalAssistanceAmount,
        repairAssistanceEligible: r.repairAssistanceEligible,
        repairAmount: r.repairAmount,
        replacementAssistanceEligible: r.replacementAssistanceEligible,
        replacementAmount: r.replacementAmount,
        sbaEligible: r.sbaEligible,
        id: r.id,
    }));
}
