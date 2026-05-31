## Agent Change Summary

### What changed
- Removed unused `changed` bookkeeping from `ExploreTable.vue`.

### User-facing impact
- No intended user-facing behavior change. Explore table pagination and items-per-page update events are preserved.

### Files changed
- `src/components/explore/ExploreTable.vue`
- `.agent/change-summaries/issue-10-frontend.md`

### README impact
- No README update needed.

### Announcement impact
- No announcement needed.

### Testing / validation
- Ran `npm run build`; `vue-tsc -b` and `vite build` completed successfully.

### Open questions
- None.
