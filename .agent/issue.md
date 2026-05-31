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

Required final artifact:
- Before finishing, create or update .agent/change-summaries/issue-10-frontend.md.
- This file will be consumed by a later documentation/release agent.
- The file is required even if no code changes were made.
- Base it only on verified repository changes. Do not invent behavior.
- Use exactly this format:

## Agent Change Summary

### What changed
- ...

### User-facing impact
- ...

### Files changed
- ...

### README impact
- ...

### Announcement impact
- ...

### Testing / validation
- ...

### Open questions
- ...

Definition of done:
- The requested frontend change is implemented.
- Relevant validation passes, or you clearly document why validation could not be run.
- .agent/change-summary.md exists and follows the required format.
- The change is ready for human review.

Full GitHub issue context follows.

# GitHub Issue #10

URL: https://github.com/mayberryjp/sando-website/issues/10

Title: Last codex run failed with error below

Labels: sando_frontend_agent_delegated

Author: @mayberryjp

## Original Issue Body

Error: src/components/explore/ExploreTable.vue(129,7): error TS6133: 'changed' is declared but its value is never read.


There was a problem with the last codex change

## Issue Comments / Conversation

### Comment by @mayberryjp at 2026-05-31T14:24:00Z

## Codex implementation notes

Issue #10 is a build failure, not a product behavior request. The reported TypeScript error is in `src/components/explore/ExploreTable.vue` at `handleOptionsUpdate` around line 129: `changed` is declared and assigned but never read.

Clarified expected behavior:
- Keep the existing `v-data-table-server` `@update:options="handleOptionsUpdate"` flow intact.
- Preserve the existing emits: `changeItemsPerPage` when the table page size changes, and `changePage` with `page - 1` when the Vuetify 1-based page changes.
- Do not add new UI behavior unless another issue asks for it.

Likely implementation:
- In `src/components/explore/ExploreTable.vue`, remove `let changed = false;` and both `changed = true;` assignments.
- Leave the two independent `if` blocks in place so an options update that changes both page size and page can still emit both events.

Acceptance criteria:
- `npm run build` passes, including `vue-tsc -b`.
- Existing table pagination and items-per-page behavior remain unchanged.

Test suggestions:
- Run `npm run build` to confirm TS6133 is resolved.
- If doing manual verification, open the Explore table and verify changing items per page still emits/loads the new page size, and changing pages still requests the expected zero-based page index.

Uncertainty:
- I am inferring from the current code that `changed` was leftover bookkeeping from a prior implementation; it has no current consumer and can be removed without changing behavior.

