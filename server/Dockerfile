FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm prisma generate
RUN pnpm build

FROM deps AS runtime
COPY . .
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["sh", "-c", "pnpm prisma generate && pnpm prisma migrate deploy && pnpm prisma:seed && pnpm start:prod"]
