# 📚 Documentation

This directory contains comprehensive technical documentation for Bloc.ai.

## 📄 Available Documents

### [API Documentation](./api-documentation.yaml)
Complete OpenAPI 3.0 specification for all REST API endpoints.
- 21 documented endpoints
- Request/response schemas
- Authentication requirements
- Import into Swagger UI or Postman

### [System Architecture](./ARCHITECTURE.md)
Detailed system architecture documentation covering:
- Client, API, Database, and External Services layers
- Data flow patterns
- Security architecture
- Deployment strategy
- Scalability considerations
- Monitoring recommendations

### [Architecture Diagram](./architecture-diagram.png)
Visual representation of the system architecture showing all components and data flows.

---

## 🔧 Using the API Documentation

### View in Swagger UI
1. Go to [editor.swagger.io](https://editor.swagger.io)
2. Copy contents of `api-documentation.yaml`
3. Paste into the editor
4. View formatted documentation

### Import into Postman
1. Open Postman
2. Import → Upload file
3. Select `api-documentation.yaml`
4. Collection will be auto-generated

### Local Development
```bash
# Install Swagger UI
npm install -g swagger-ui-watcher

# Serve documentation
swagger-ui-watcher docs/api-documentation.yaml
```

---

## 📝 Maintaining Documentation

### When to Update

**API Documentation** - Update when:
- Adding new endpoints
- Changing request/response schemas
- Modifying authentication
- Adding new error codes

**Architecture Documentation** - Update when:
- Adding new services/integrations
- Changing deployment strategy
- Updating database schema
- Modifying security patterns

### Version Control
All documentation is version-controlled in Git. Major updates should:
1. Update version numbers
2. Add changelog entry
3. Commit with descriptive message

---

**Last Updated**: December 2025
