# syntax=docker/dockerfile:1
# taskflow-app/web — stack custom (Next.js 16, `next start`), base image Docker Hardened Images.
# Build:  docker build --build-arg VERSION=<semver> --build-arg COMMIT=<sha> -t taskflow-app/web:<semver> .
# Runtime: distroless Node as non-root (uid 65532) on port 3001; GET /health returns {"status":"ok","version":$VERSION}.
# Configuration comes only from the environment: TASKFLOW_API_URL (server-side only, never sent to the browser).
ARG NODE_VERSION=22

FROM dhi.io/node:${NODE_VERSION}-dev AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build \
 && npm prune --omit=dev --no-audit --no-fund

FROM dhi.io/node:${NODE_VERSION} AS runtime
ARG VERSION=0.0.0-local
ARG COMMIT=unknown
LABEL org.opencontainers.image.title="taskflow-app/web" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${COMMIT}" \
      org.opencontainers.image.source="https://github.com/integranz/taskflow-app"
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3001 \
    VERSION=${VERSION}
COPY --from=build --chown=65532:65532 /app/package.json /app/next.config.ts ./
COPY --from=build --chown=65532:65532 /app/node_modules ./node_modules
COPY --from=build --chown=65532:65532 /app/.next ./.next
USER 65532
EXPOSE 3001
ENTRYPOINT ["node", "node_modules/next/dist/bin/next", "start", "-p", "3001"]
