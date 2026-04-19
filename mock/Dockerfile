FROM node:20-alpine

WORKDIR /app

# Install Prism globally
RUN npm install -g @stoplight/prism-cli@5

EXPOSE 8080

# Run Prism mock server returning examples from OpenAPI spec
CMD ["prism", "mock", "-h", "0.0.0.0", "-p", "8080", "/spec/openapi.yaml"]
