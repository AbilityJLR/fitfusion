FROM node:20-alpine AS base

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# ====================== DEVELOPMENT ======================
FROM base AS development

# Set development environment
ENV NODE_ENV=development

# Development specific dependencies
RUN npm install -g nodemon

# Copy the Next.js app for development (will be overridden by volume mount)
COPY . .

# Expose port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]

# ====================== BUILDER ======================
FROM base AS builder

# Copy the Next.js app for building
COPY . .

# Build the Next.js application
RUN npm run build

# ====================== PRODUCTION ======================
FROM node:20-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy next.config and package.json
COPY --from=builder /app/next.config*.mjs ./
COPY --from=builder /app/package*.json ./

# Copy built Next.js files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"] 