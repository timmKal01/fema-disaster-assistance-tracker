import { Actor, log } from 'apify';
import { fetchRegistrants } from './fema.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { disasterNumber, state, maxResults = 50 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const REGISTRANTS_SEARCH_EVENT = 'registrants-search';

if (!disasterNumber && !state) {
    throw new Error('Provide at least "disasterNumber" or "state" to scope the search.');
}

const registrants = await fetchRegistrants({
    disasterNumber,
    state,
    maxResults: Math.min(maxResults, 500),
});

for (const r of registrants) {
    await Actor.pushData(r);
}

await Actor.charge({ eventName: REGISTRANTS_SEARCH_EVENT });

log.info(`Pushed ${registrants.length} registrant record(s)`);

await Actor.exit();
