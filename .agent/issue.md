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

# GitHub Issue #1

URL: https://github.com/mayberryjp/sando-website/issues/1

Title: Support Discord notifications mechanism

Labels: sando_frontend_agent_delegated

Author: @mayberryjp

## Original Issue Body

Scope of work: 

* Under NOTIFICATIONS CONFIG in Settings components, support configuration settings for three new settings
* DiscordWebhookUrl (string)
* DiscordEnabled (toggle)

## Issue Comments / Conversation

### Comment by @mayberryjp at 2026-05-27T06:24:25Z

## Codex implementation notes

Issue asks for three settings under the existing Settings -> Notifications Config area:
- `DiscordWebhookUrl` as a string/text input.
- `DiscordEnabled` as a boolean toggle.
- The issue says "three new settings" but only names two; treat the third setting as an open question unless product clarifies it.

Likely implementation path:
- `src/views/SettingsView.vue` owns the static `configurationDefinitions` list and groups entries by `category`. Add the Discord entries there with `category: "Notifications"` so they appear in the existing `config-notifications` tab.
- `src/components/settings/configurations/NotificationsSection.vue` delegates to `StandardConfigurationSection`, so a `Text/String` entry should render as a `v-text-field` and a `Boolean/Toggle` entry should render as a `v-switch` without a custom Notifications UI.
- `src/components/settings/configurations/StandardConfigurationSection.vue` currently persists text on blur/Enter and toggles as `1`/`0`; confirm the backend expects the same value format for `DiscordEnabled`.
- `src/types/configurations.ts` already allows `Text/String` and `Boolean/Toggle`; no type expansion should be needed unless the third setting introduces a new control type.

Suggested field metadata:
- Display name: `Discord Webhook URL`, key: `DiscordWebhookUrl`, type: `Text/String`, default empty string, suggested value could be a Discord webhook URL placeholder only if the app already uses examples in settings copy.
- Display name: `Discord Notifications`, key: `DiscordEnabled`, type: `Boolean/Toggle`, default `Disabled`, suggested `Enabled` only if Discord notifications should be opt-in after the webhook is configured. If the product expects conservative defaults, use `Disabled` for both default and suggested.

Acceptance criteria:
- The Notifications Config tab shows the Discord webhook URL and Discord enabled toggle alongside existing notification settings.
- Editing the webhook URL saves through the existing `/configurations` POST path on blur and Enter.
- Toggling Discord enabled saves through the same update path and shows the existing success/error notification behavior.
- Existing notification settings still render and update as before.
- Empty/missing API values do not break rendering; the URL field should be blank and the toggle should be off.

Test suggestions:
- Unit/component test or focused manual check that `groupedConfigurations["Notifications"]` includes the new definitions and that the rendered controls match text vs toggle types.
- Manual API-backed check in Settings: change `DiscordWebhookUrl`, toggle `DiscordEnabled`, refresh, and verify values persist.

Uncertainty:
- The issue says three new settings but lists only `DiscordWebhookUrl` and `DiscordEnabled`. The coding agent should not invent the missing setting; ask product or inspect backend configuration keys if available in a paired backend repo/task.

---

### Comment by @mayberryjp at 2026-05-27T06:30:51Z

correction there are only two new settings

