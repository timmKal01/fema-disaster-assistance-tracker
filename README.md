# FEMA Disaster Assistance Tracker: Housing by Disaster

Search FEMA's public Individual Assistance housing registrant data by
disaster number or state. Get back damage type, assistance eligibility, and
payout amounts per registrant, de-identified, straight from FEMA's own
database.

## Who this is for

- **Disaster recovery contractors and nonprofits** scoping unmet need by disaster or area before deploying resources.
- **Journalists and researchers** tracking disaster relief patterns and assistance gaps.
- **Case managers and relief organizations** understanding the scale and type of damage reported for a disaster.

## Input

| Field | Type | Description |
|---|---|---|
| `disasterNumber` | integer | FEMA disaster number, e.g. `4332`. Provide this and/or `state`. |
| `state` | string | Two-letter US state code of the damaged property, e.g. `"TX"`. |
| `maxResults` | integer (default `50`) | Cap on registrant records returned. |

```json
{
  "disasterNumber": 4332,
  "maxResults": 50
}
```

## Output

One record per registrant:

```json
{
  "disasterNumber": 4332,
  "damagedCity": "HOUSTON",
  "damagedStateAbbreviation": "TX",
  "damagedZipCode": "77036",
  "residenceType": "Apartment",
  "ownRent": "Renter",
  "primaryResidence": true,
  "householdComposition": 1,
  "grossIncome": 1800,
  "specialNeeds": true,
  "homeOwnersInsurance": false,
  "floodInsurance": false,
  "inspected": false,
  "destroyed": false,
  "floodDamage": false,
  "foundationDamage": false,
  "roofDamage": false,
  "rentalAssistanceEligible": false,
  "rentalAssistanceAmount": null,
  "repairAssistanceEligible": false,
  "repairAmount": null,
  "replacementAssistanceEligible": false,
  "replacementAmount": null,
  "sbaEligible": false,
  "id": "d214ed1e-951e-484b-b014-2a885a7ea234"
}
```

This is FEMA's public de-identified registrant dataset: no names or exact
addresses, only city/state/zip and household-level detail. Covers large
disasters only (FEMA's own dataset scope, not every declared disaster).

## How it works

One direct call to the OpenFEMA Individual Assistance Housing Registrants
API (`fema.gov/api/open/v1/IndividualAssistanceHousingRegistrantsLargeDisasters`),
no scraping, no key, no proxy.

## Related products

- [FEMA Flood Claims Lookup](https://github.com/timmKal01/fema-flood-claims-lookup) — NFIP flood insurance claim history, a narrower flood-specific signal
- [Disaster Declaration Tracker](https://github.com/timmKal01/disaster-declaration-tracker) — new FEMA disaster declarations, upstream of the assistance activity this actor tracks
