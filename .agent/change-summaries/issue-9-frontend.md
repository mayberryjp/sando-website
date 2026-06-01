## Agent Change Summary

### Agent
- Frontend

### GitHub issue
- #9

### What changed
- Added an Offline Notifications toggle button to the host details action row with enabled/disabled text, success/error coloring, a distinct LAN connect/disconnect icon, loading state, success/error notifications, and persisted-state refresh after successful toggles.
- Added a host service wrapper for `PUT localhosts/{ip_address}/offline-notifications-enabled` with an `offline_notifications_enabled` payload.
- Added `offline_notifications_enabled` to the localhost type and passed it from the host details view into the action component.
- Added a `Detect Offline Hosts` INT detection configuration near the top of the Detections settings list with default and suggested values set to Enabled.
- Removed the unused `changed` local in `ExploreTable.vue` so TypeScript validation no longer fails on TS6133.

### User-facing impact
- Host detail pages now show a per-host Offline Notifications Enabled/Disabled control near the existing Notifications and Detections buttons.
- Settings > Detections now includes a Detect Offline Hosts row that uses the existing Alert, Notify, and ReNotify checkbox behavior.

### Files changed
- `src/components/host-details/HostActions.vue`
- `src/views/HostDetailsView.vue`
- `src/services/hosts.ts`
- `src/types/localhosts.ts`
- `src/views/SettingsView.vue`
- `src/components/explore/ExploreTable.vue`
- `.agent/change-summaries/issue-9-frontend.md`

### README impact
- No README changes were made.

### Announcement impact
- Announce that hosts can now have offline notifications toggled individually and that offline host detection is available in detection settings once the backend API/configuration support is deployed.

### Testing / validation
- `npm ci` completed successfully.
- `npm run build` completed successfully after removing the pre-existing unused `changed` local from `ExploreTable.vue`.

### Open questions
- Confirm the backend uses `offline_notifications_enabled`, `PUT /api/localhosts/{ip_address}/offline-notifications-enabled`, and `OfflineHostsDetection` for the paired API/configuration implementation.
