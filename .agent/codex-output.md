Implemented the Notifications Config change in [SettingsView.vue](/tmp/runner/work/sando-website/sando-website/src/views/SettingsView.vue:655).

Added:
- `DiscordEnabled` as a `Boolean/Toggle`
- `DiscordWebhookUrl` as a `Text/String`

These use the existing `NotificationsSection` and `StandardConfigurationSection`, so saving behavior follows the current `/configurations` update path for blur, Enter, and toggle changes.

Validation:
- Ran `npm ci`
- Ran `npm run build` successfully

Note: `npm ci` reported existing dependency audit findings, but I did not change dependencies for this issue. The only source change is `src/views/SettingsView.vue`; existing untracked `.agent/` was left untouched.