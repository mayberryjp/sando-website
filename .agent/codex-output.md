Implemented the Discord notification settings in [SettingsView.vue](/tmp/runner/work/sando-website/sando-website/src/views/SettingsView.vue:652).

Added under Notifications Config:
- `DiscordEnabled` as a `Boolean/Toggle`
- `DiscordWebhookUrl` as a `Text/String`

These use the existing `NotificationsSection` and `StandardConfigurationSection`, so they save through the same existing `/configurations` update path as the other settings.

Validation:
- Ran `npm ci`
- Ran `npm run build` successfully

Note: `npm ci` reported existing audit findings, but I did not change dependencies for this frontend settings change. The pre-existing untracked `.agent/` directory was left untouched.