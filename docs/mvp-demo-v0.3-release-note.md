# Katris Travel MVP Demo v0.3 Release Note

## Release Overview

- Production URL: `https://katris-travel-pearl.vercel.app`
- Commit hash: `ee01662f2c2a0fbd42d3ab6480f122bf2548d492`
- Branch: `main`
- Release tag: `mvp-demo-v0.3`
- Deployment mode: Vercel Production deployment from `main`

## Deployment Info

- Repository: `forght6-cloud/katris-travel`
- Verified feature branch baseline: `html-template-redesign`
- Production promotion method: merged verified MVP Demo v0.3 flow into `main`, then deployed through Vercel Git production flow
- Stable production alias:
  - `https://katris-travel-pearl.vercel.app`
  - `https://katris-travel-forght-6-9313s-projects.vercel.app`

## Core MVP Features

1. Requirement intake with planner form and route brief generation
2. Recommended Execution Path with explicit `等待确认` state
3. Multi-offer flight decision cards with recommendation labeling and five-force scoring
4. Selected flight state management without auto-purchase or auto-confirmation
5. Trip Effort Analysis with overall intensity and day-level effort cards
6. Booking Checklist with selected, purchased, confirmed, and needs-change states
7. Confirmation code capture for booking items
8. Final travel execution plan export through print view and browser PDF save flow
9. Travel Assistant in-page reminder mode with important and standard views
10. Stale recommendation invalidation when planner inputs such as budget change

## Real API Status

- OpenAI: real API enabled in production
- Amadeus: real API enabled in production
- Current production flight results no longer show mock fallback messaging during smoke test

## Known Limitations

1. State is browser-scoped and not backed by account-level persistence.
2. Final travel PDF is browser print output, not a backend-generated binary PDF.
3. Hotels, tickets, and local transport still include placeholder or recommendation-style items in parts of the flow.
4. Travel Assistant is an in-page reminder layer, not Web Push or system notification delivery.
5. No App package, no Dynamic Island, no location-aware behavior, no database, and no login system are included in MVP Demo v0.3.
6. Recommended execution items are guidance only and do not represent completed payment or supplier confirmation.
7. Supplier inventory, price, and purchase outcome remain subject to the external booking platform at checkout time.

## Demo Flow

Demo input:

```txt
Departure: LAX
Destination: JFK
Travel date: future date 30 days out
Travelers: 1
Budget: 1000 USD
Notes: 不要红眼航班
```

Demo path:

1. Open production URL
2. Generate plan
3. Review Recommended Execution Path
4. Confirm it shows `等待确认` rather than confirmed
5. Review flight decision cards
6. Select one flight
7. Review hotel item inside Booking Checklist
8. Review Trip Effort Analysis
9. Click `我已购买`
10. Fill confirmation code `ABC123`
11. Click `生成最终旅行执行单`
12. Confirm print window opens
13. Enable Travel Assistant
14. Switch between `只看重要提醒` and `标准提醒`
15. Change budget
16. Confirm previous recommendation enters stale state

## Smoke Test Result

- Production URL was anonymously accessible without Vercel login
- Core planner flow passed
- Recommended Execution Path stayed in `等待确认` until user action
- Flight decision cards rendered and selection state updated correctly
- Booking Checklist rendered selected hotel and pending placeholder items correctly
- Trip Effort Analysis rendered correctly
- Purchase-state update and confirmation-code flow worked
- Final execution-plan print window opened successfully
- Travel Assistant mode toggling worked
- Updating budget correctly marked the previous recommendation as stale
- No console error observed during production smoke test
- No page error observed during production smoke test
- Production API calls returned `200` during smoke test
