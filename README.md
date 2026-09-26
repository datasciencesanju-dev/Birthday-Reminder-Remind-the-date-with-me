# Birthday Reminder - Remind the date with me

An offline-first Android birthday reminder app built with Expo React Native and a TypeScript Express API.

## Included

- Year-at-a-glance birthday calendar
- Upcoming birthday list with countdowns and age calculation
- Search by name, relationship, phone, email, or nickname
- Add, edit, share, and soft-delete birthday records
- Local Android notifications with configurable lead time
- JSON backup export/import
- Light/dark semantic color tokens
- OpenAPI contract and generated TypeScript client/Zod models

## Run locally

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/birthday-reminder run dev
```

Scan the Expo QR code with Expo Go to open the Android app on a phone.

## Structure

- `artifacts/birthday-reminder` — mobile client
- `artifacts/api-server` — Express REST API
- `lib/api-spec/openapi.yaml` — API source of truth

The app stores core birthday data locally on-device. The API is ready for a future cloud-sync adapter without making network access a requirement for the mobile experience.