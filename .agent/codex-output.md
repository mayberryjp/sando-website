Implemented issue #4.

Changed `docker_example_configs/Dockerfile` to use `node:24-alpine` for the build-stage base image. Added the required summary at `.agent/change-summaries/issue-4-frontend.md`.

Validation:
- `npm ci` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Docker build could not run because the Docker daemon is not reachable at `/var/run/docker.sock`.

Note: `.agent/issue.md` was already modified before my work and I left it untouched.