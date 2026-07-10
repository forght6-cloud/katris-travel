## MVP Demo Polish Note

### `api/generate-plan.js` dirty state

`api/generate-plan.js` currently differs from a clean historical baseline because the system prompt keeps this instruction:

`如果 payload 中包含 confirmedPreferences，必须把它当作已经由用户确认过的关键偏好，而不是自行覆盖。`

This is intentional. It was introduced for the confirmed-preferences flow in Task 1.1 so the server-side planning prompt respects user-approved flight timing, connection tolerance, stay priority, and trip intensity.

### Why it stays

- It does not change the frontend UI.
- It does not expose any secret in the client.
- It does not break the current `/api/generate-plan` response shape used by the frontend.
- `node --check api/generate-plan.js` passes.

For the MVP demo, treat this as a valid prompt enhancement rather than an abnormal dirty file.
