import { Actor, log } from 'apify';
import { fetchRegistrants } from './fema.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { disasterNumber, maxResults = 50 } = input;
let { state } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const REGISTRANTS_SEARCH_EVENT = 'registrants-search';

// An empty run (first click in the Console, Apify's daily health check) must
// still return data, or Apify flags the actor "under maintenance". Only when
// both are empty: a default state would wrongly narrow a disaster-number search.
if (!disasterNumber && !state) {
    state = 'TX';
    log.info('No disasterNumber or state given; defaulting to state "TX".');
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
