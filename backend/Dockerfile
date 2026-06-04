FROM node:22-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Non-root user for security
RUN addgroup -S habitscape && adduser -S habitscape -G habitscape
RUN chown -R habitscape:habitscape /app
USER habitscape

EXPOSE 5000

# Default: run db:init then start server
CMD ["sh", "-c", "npm run db:init && npm start"]
