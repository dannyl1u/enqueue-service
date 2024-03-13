# Use the official Node.js 16 as a parent image
FROM node:16-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Use TypeScript to compile your app
RUN npm install typescript -g
RUN tsc

# Expose the port your app runs on
EXPOSE 7000

# Command to run your app
CMD ["node", "dist/index.js"]
