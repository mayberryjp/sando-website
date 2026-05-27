Implemented the config secret masking in [StandardConfigurationSection.vue](/tmp/runner/work/sando-website/sando-website/src/components/settings/configurations/StandardConfigurationSection.vue:16).

Sensitive fields now render as password inputs by default and get an independent `mdi-eye` / `mdi-eye-off` appended toggle. The underlying `setting.value`, blur handling, and Enter-save flow are unchanged. The sensitive key list covers the seven fields from the issue.

Validation: `npm run build` passes. It reports the existing Vite large chunk warning, and `npm ci` reported existing npm audit findings; I did not change dependency versions. Also note `.agent/issue.md` was already modified and I left it untouched.