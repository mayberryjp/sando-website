Implemented the issue #10 frontend fix.

Changed [ExploreTable.vue](/tmp/runner/work/sando-website/sando-website/src/components/explore/ExploreTable.vue:126) to remove the unused `changed` variable and assignments while preserving the existing independent `changeItemsPerPage` and `changePage(page - 1)` emits.

Added the required summary at [.agent/change-summaries/issue-10-frontend.md](/tmp/runner/work/sando-website/sando-website/.agent/change-summaries/issue-10-frontend.md:1).

Validation:
- Ran `npm ci` because dependencies were not installed.
- Ran `npm run build`; `vue-tsc -b && vite build` passed.
- `npm ci` reported existing audit findings: 12 vulnerabilities. I did not change dependencies for this scoped fix.

Note: `.agent/issue.md` was already modified before my changes and I left it untouched.