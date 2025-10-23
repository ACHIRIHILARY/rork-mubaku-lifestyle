FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose ports for Expo
EXPOSE 19000 19001 19002

# Start Expo development server
CMD ["npx", "expo", "start", "--tunnel"]