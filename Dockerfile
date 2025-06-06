# Use AWS Lambda Node.js base image
FROM public.ecr.aws/lambda/nodejs:20

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the compiled JavaScript code
COPY dist/index.js ./

# Set the handler
CMD ["index.handler"]