FROM node:20-alpine

WORKDIR /usr/src/app

# 1. Copy only package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# 2. Install dependencies and generate Prisma client
RUN npm install && npx prisma generate

# 3. Copy all other files
COPY . .

# 4. Build the application
RUN npx tsc

CMD ["node", "dist/index.js"]