## Agent Change Summary

### What changed
- Updated the Docker build-stage Node base image from `node:22-alpine` to `node:24-alpine`.

### User-facing impact
- Docker image builds now use the newer Node 24 Alpine base image for compiling the frontend assets.

### Files changed
- `docker_example_configs/Dockerfile`
- `.agent/change-summaries/issue-4-frontend.md`

### README impact
- No README changes were made.

### Announcement impact
- No announcement content is required.

### Testing / validation
- `npm ci` completed successfully.
- `npm run build` completed successfully.
- `docker build -f docker_example_configs/Dockerfile -t sando-website:issue-4-check docker_example_configs` could not run because the Docker daemon was not reachable at `/var/run/docker.sock`.

### Open questions
- None.
