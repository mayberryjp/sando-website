## Agent Change Summary

### Agent
- Frontend

### GitHub issue
- #14

### What changed
- Added an opt-in time filter control to `RecentAlerts.vue` with visible options for 48 Hours, 7 Days, 14 Days, and All Time.
- Set the default selected filter to 48 Hours.
- Filtered dashboard alerts by each alert's `first_seen` timestamp; missing or unparsable `first_seen` values are hidden for time-window filters and shown when All Time is selected.
- Enabled the time filter only on the dashboard Most Recent Detections table via `DashboardView.vue`.

### User-facing impact
- Dashboard users see a segmented time filter beside the Most Recent Detections header.
- The dashboard table defaults to alerts first seen within the previous 48 hours and can be expanded to 7 days, 14 days, or all alerts passed into the table.
- Host-specific alert tables keep their previous behavior and do not show the new filter.

### Files changed
- `src/components/dashboard/RecentAlerts.vue`
- `src/views/DashboardView.vue`
- `.agent/change-summaries/issue-14-frontend.md`

### README impact
- No README changes required.

### Announcement impact
- Dashboard Most Recent Detections now has a visible time filter defaulting to 48 Hours.

### Testing / validation
- Ran `npm ci` to install locked dependencies.
- Ran `npm run build`; build passed.
- Vite emitted the existing large chunk-size warning.

### Open questions
- None.
