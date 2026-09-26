# Birthday Reminder

Offline-first Android birthday reminders with a calendar, upcoming list, local notifications, import/export, and a small Express API for future sync.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/birthday-reminder run dev` — run the Expo Android app preview
- `pnpm --filter @workspace/birthday-reminder run typecheck` — typecheck the mobile app
- `pnpm --filter @workspace/api-server run typecheck` — typecheck the API
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required workflow env: `PORT` — injected by the managed workflows

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 57 + React Native + Expo Router
- API: Express 5 + TypeScript
- Local persistence: AsyncStorage
- Server storage: development memory store, ready for MongoDB adapter
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/birthday-reminder/app/` — Expo Router screens
- `artifacts/birthday-reminder/context/BirthdayContext.tsx` — offline data and settings state
- `artifacts/birthday-reminder/utils/birthday.ts` — date, age, calendar, and export helpers
- `artifacts/api-server/src/routes/birthdays.ts` — validated birthday REST API
- `lib/api-spec/openapi.yaml` — source of truth for generated API clients

## Architecture decisions

- The mobile app is offline-first so adding and viewing birthdays does not depend on a network connection.
- Birthday dates are stored once as the original date of birth; yearly calendar dates are derived at runtime.
- Notifications are scheduled locally on the device and request permission only when a reminder is first saved.
- The API is intentionally separate from the core mobile flow so cloud sync can be added without making the app unusable offline.

## Product

The app provides a year-at-a-glance calendar, upcoming birthday list, search, add/edit/detail flows, reminder preferences, soft-delete behavior, JSON backup import/export, share actions, dark theme tokens, and Android notification scheduling.

## User preferences

- Product name: `Birthday Reminder - Remind the date with me`
- Requested implementation language: MERN-style JavaScript/TypeScript stack with a React Native Android client and Express backend.

## Gotchas

- The complete root typecheck currently reports unrelated React 19 ref typing errors in the existing `artifacts/mockup-sandbox` component library; the mobile and API package checks pass.
- Android publishing to Google Play is not handled by Replit's Expo publishing flow; use the generated Expo project with the appropriate Android release process.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
