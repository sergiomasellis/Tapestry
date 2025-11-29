FROM node:20-slim AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Run the application
CMD ["pnpm", "start"]



