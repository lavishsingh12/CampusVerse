# CampusVerse API Documentation

This directory contains specifications, schemas, and endpoint guidelines for the CampusVerse Backend API.

## API Versioning

- Base URL for v1 API: `/api/v1`
- OpenAPI Specification: Available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the backend is running.

## Current Endpoints

### System Endpoints
- `GET /api/v1/health` - Health check status endpoint.
  - Response: `{"status": "ok"}`
