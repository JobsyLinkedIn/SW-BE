# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies (cache layer)
COPY package*.json ./


RUN npm install 

# Copy the entire application code
COPY . .


# Expose the port your server uses (e.g., 3000)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]