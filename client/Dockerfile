FROM node:20-alpine AS development

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reloading
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true
CMD ["npm", "run", "dev", "--", "--turbo"] 