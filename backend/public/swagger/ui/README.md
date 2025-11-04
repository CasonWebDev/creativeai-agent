# Swagger UI - API Documentation Interface

This directory contains the Swagger UI interface for the CreativeAI Agent API.

## Accessing Swagger UI

### Local Development
```
http://localhost:8000/swagger/ui/
```

### Files

- **index.html** - Swagger UI interface (loads openapi.json from parent directory)
- **.htaccess** - Apache rewrite rules for proper routing
- **../openapi.json** - OpenAPI 3.0.0 specification

## Features

- 📖 Interactive API documentation
- 🧪 Built-in request testing (Try it out!)
- 🔐 JWT Bearer authentication support
- 📱 Responsive mobile-friendly design
- 🎨 Dark/Light theme toggle
- 📥 Download OpenAPI spec

## How It Works

1. **index.html** is served by the web server
2. Swagger UI loads CSS and JS from CDN (Swagger UI v3)
3. JavaScript loads the OpenAPI specification from `../openapi.json`
4. All API endpoints are displayed with interactive documentation

## Testing Endpoints

1. Navigate to `http://localhost:8000/swagger/ui/`
2. Expand any endpoint to see details
3. Click "Try it out" to test the endpoint
4. Fill in required parameters
5. Click "Execute" to send the request
6. View response in the Response section

### Authentication

For protected endpoints (logout, me):
1. First obtain an access token via `/api/v1/auth/login`
2. Copy the `access_token` value
3. Click the 🔒 "Authorize" button at the top
4. Select "BearerToken"
5. Paste `Bearer YOUR_ACCESS_TOKEN` in the value field
6. Click "Authorize"
7. Now test protected endpoints

## Updating Documentation

When you add new endpoints:

1. Update `backend/openapi/endpoints.php` with new `@OA\Post` or `@OA\Get` annotations
2. Regenerate the OpenAPI spec:
   ```bash
   cd backend
   php vendor/bin/openapi openapi/ -o public/swagger/openapi.json
   ```
3. Refresh `http://localhost:8000/swagger/ui/` in your browser
4. New endpoints will appear in Swagger UI

Or manually edit `backend/public/swagger/openapi.json` and refresh.

## Browser Compatibility

Swagger UI supports all modern browsers:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## External Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [JWT Authentication](https://jwt.io/)

## Notes

- Swagger UI uses CDN for CSS and JavaScript (requires internet connection)
- Local `openapi.json` is served from the backend
- Cross-Origin requests should work as the UI is served from the same domain

---

**Created**: November 4, 2025
**OpenAPI Version**: 3.0.0
**Swagger UI Version**: 3.x
