FROM oven/bun:1 AS base

WORKDIR /app

# Copy dependency files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Run the application
CMD ["bun", "run", "start"]



