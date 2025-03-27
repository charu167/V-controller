# Use official Node image (Debian-based for better compatibility with Prisma)
FROM node:20-bullseye

# Set working directory
WORKDIR /usr/src/app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client (MUST happen after npm install)
RUN npx prisma generate

# Copy the rest of the files
COPY . .

# Build TypeScript
RUN npx tsc

# Expose port
EXPOSE 3001

# Run the app
CMD ["node", "dist/index.js"]