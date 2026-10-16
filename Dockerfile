# Frontend DSC (Angular 22). Build desde el directorio sistema-dsc-frontend.
FROM node:22-bookworm-slim AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY . .
RUN pnpm build:prod

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sistema-dsc-frontend/browser /usr/share/nginx/html
EXPOSE 80
