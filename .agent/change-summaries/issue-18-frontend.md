## Agent Change Summary

### Agent
- Frontend

### GitHub issue
- #18

### What changed
- Added a main dashboard site traffic section between the quick stats row and recent alerts.
- Added a dashboard traffic chart that displays the last 100 aggregate hourly records with total bytes as the primary line series, plus total packets and alerts as secondary series and tooltip values.
- Added loading, empty, and API-error states for the dashboard traffic section.
- Added a frontend stats service method for `GET /api/trafficstats`.

### User-facing impact
- Users will see aggregate site-wide traffic trends on the main dashboard once the backend `/api/trafficstats` endpoint is available.
- Recent alerts and existing dashboard quick stats remain visible in their existing positions around the new section.

### Files changed
- `src/components/dashboard/TrafficStats.vue`
- `src/services/stats.ts`
- `src/views/DashboardView.vue`
- `.agent/change-summaries/issue-18-frontend.md`

### README impact
- No README changes were made.

### Announcement impact
- Dashboard now includes site-wide traffic trend visibility using aggregate traffic stats.

### Testing / validation
- Ran `npm ci` to install dependencies from the existing lockfile.
- Ran `npm run build`; production build completed successfully.

### Open questions
- None.
