FROM node:22-alpine AS base

# install dependencies
FROM base AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# build the application
FROM base AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

# production image
FROM base AS prod

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/generated ./generated
COPY --from=build /app/dist ./dist

EXPOSE 3000

ENV PORT=3000
ENV HOST="0.0.0.0"

CMD ["node", "dist/main"]