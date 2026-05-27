You are working in the mayberryjp/sando-website repository.

Implement the requested frontend change from this GitHub issue.

Important:
- You must inspect the repository and make source code changes unless the feature is already implemented.
- Do not only summarize the issue.
- Do not stop after analysis.
- If no code change is needed, explain exactly which existing files already implement the behavior.
- Make the smallest reasonable code change.
- Prefer frontend/UI/client code changes.
- Do not edit unrelated files.
- Do not change secrets, credentials, workflow permissions, runner config, or Docker runner configuration.
- Do not edit files under .github/workflows unless the issue explicitly asks for workflow changes.
- Avoid backend/API/server changes unless the issue explicitly requires them.
- Preserve the existing styling and component patterns used by the project.
- Run relevant tests, linting, or build checks if available.
- Leave the repo in a commit-ready state.

Definition of done:
- The requested frontend change is implemented.
- Relevant validation passes, or you clearly document why validation could not be run.
- The change is ready for human review.

Full GitHub issue context follows.

# GitHub Issue #5

URL: https://github.com/mayberryjp/sando-website/issues/5

Title: Hide secrets in config UI - have a show/hide button

Labels: sando_frontend_agent_delegated

Author: @mayberryjp

## Original Issue Body

The following secrets should not display on the screen in their input box. They should be starred out. There should be an eye "icon" to show/obscure the config variable. Default is obscured with stars. 
* Telegram bot token
* Telegram chat id
* Discord webhook URL
* pihole api key
* adguard username
* adguard password
* maxmind api key
* 

## Issue Comments / Conversation

### Comment by @mayberryjp at 2026-05-27T22:24:22Z

Codex implementation notes

- Expected behavior: the listed secret-like configuration fields should render obscured by default in the settings UI, with an eye/eye-off control that toggles only that field between hidden and visible. Inference: use password-style masking rather than replacing the underlying `setting.value`, so blur/enter update behavior remains unchanged.
- Affected configuration keys from `src/views/SettingsView.vue`: `TelegramBotToken`, `TelegramChatId`, `DiscordWebhookUrl`, `PiholeApiKey`, `AdGuardUsername`, `AdGuardPassword`, and `MaxMindAPIKey`.
- Likely primary implementation point: `src/components/settings/configurations/StandardConfigurationSection.vue`, where all non-toggle text settings are rendered through `v-text-field`. Add a small helper such as `isSensitiveSetting(setting.key)` and per-key visibility state, then set `:type` to `password` when sensitive and hidden, otherwise preserve existing behavior (`number` for `Text/Int`, `text` for regular fields).
- Vuetify already has Material Design Icons available via `@mdi/font`; use an appended eye/eye-off icon button on sensitive fields only. Keep the default state hidden when the component mounts or settings refresh.
- Do not mask non-secret fields such as PiHole URL, AdGuard URL, high-risk port lists, intervals, or ordinary text configuration values.
- Edge cases: empty values should still show an empty input with the eye control; toggling visibility should not trigger a save; loading/disabled state should keep the field and icon interaction consistent with the existing disabled behavior; each field's show/hide state should be independent.
- Acceptance criteria: visiting Settings > Notifications Configuration, Discovery, and Detection Fine Tuning shows the named fields hidden by default; clicking the eye reveals the real value for that field only; clicking again hides it; editing and blur/Enter still posts the same value through `updateConfigurationValue`.
- Test suggestions: run `npm run build`; if adding component tests is practical, cover `isSensitiveSetting`/input type behavior and verify visibility toggles do not emit `updateConfigurationValue`. Manual browser check should include at least one sensitive field and one adjacent non-sensitive text field.
- Uncertainty: the issue says starred out; native password inputs typically show bullets rather than literal stars. Confirm only if exact star glyphs are required; otherwise password masking should satisfy the intent.

---

### Comment by @mayberryjp at 2026-05-27T22:40:53Z

bullets obscuring the text is ok. it's what i meant by stars. 

