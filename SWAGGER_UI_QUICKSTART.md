# Swagger UI Setup - Quick Start Guide

## ✅ Setup Complete!

Your Swagger UI is now ready to use at:

### 🎯 **http://localhost:8000/swagger/ui/**

## 📋 What You Get

- ✅ Interactive API documentation for all 9 endpoints
- ✅ Built-in testing interface ("Try it out")
- ✅ JWT Bearer authentication support
- ✅ Real-time request/response viewing
- ✅ Dark mode support
- ✅ Mobile responsive design

## 🚀 Getting Started

### 1. **Start Your Development Server**
```bash
./docker.sh up
```

### 2. **Open Swagger UI**
Visit: `http://localhost:8000/swagger/ui/`

### 3. **Test an Endpoint**

**Example: Register a User**
1. Find the `POST /api/v1/auth/register` endpoint
2. Click to expand it
3. Click **"Try it out"**
4. Fill in the form:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123!",
     "tier": "free"
   }
   ```
5. Click **"Execute"**
6. See the response below

## 🔐 Testing Protected Endpoints

For endpoints that require authentication (like `/api/v1/auth/me`):

### Step 1: Get an Access Token
1. Call `POST /api/v1/auth/login` with credentials
2. Copy the `access_token` from the response

### Step 2: Authorize Requests
1. Click the 🔒 **"Authorize"** button at the top
2. Select **"BearerToken"**
3. Paste: `Bearer YOUR_ACCESS_TOKEN`
4. Click **"Authorize"**
5. Click **"Close"**

### Step 3: Test Protected Endpoint
1. Call `GET /api/v1/auth/me`
2. It should now work with your token

## 📂 File Structure

```
backend/public/swagger/
├── ui/
│   ├── index.html          # Swagger UI interface
│   ├── .htaccess           # Routing configuration
│   └── README.md           # Detailed UI documentation
├── openapi.json            # API specification
```

## 🔄 Workflow for Testing

### Full Authentication Flow:
```
1. POST /api/v1/auth/register     → Create account
2. POST /api/v1/auth/confirm-email → Verify email
3. POST /api/v1/auth/login         → Get tokens
4. GET  /api/v1/auth/me            → View profile (protected)
5. POST /api/v1/auth/logout        → Logout (protected)
```

### Password Reset Flow:
```
1. POST /api/v1/auth/forgot-password      → Request reset
2. POST /api/v1/auth/verify-reset-token   → Verify token
3. POST /api/v1/auth/reset-password       → Complete reset
```

## 📝 Common Tasks

### View API Specification
- **File**: `backend/public/swagger/openapi.json`
- **URL**: `http://localhost:8000/swagger/openapi.json`

### Update Documentation
When adding new endpoints:
1. Edit `backend/openapi/endpoints.php`
2. Add new `@OA\Post` or `@OA\Get` annotation
3. Regenerate: `cd backend && php vendor/bin/openapi openapi/ -o public/swagger/openapi.json`
4. Refresh Swagger UI

### View Tests
Run the test suite to verify all endpoints work:
```bash
./docker.sh exec app php vendor/bin/phpunit tests
```
**Current Status**: ✅ 56/56 tests passing

## 🎨 UI Features

- **Expand/Collapse**: Click endpoint to toggle details
- **Try it out**: Test with real data
- **Authentication**: 🔒 Button for JWT tokens
- **Response**: View status code, headers, body
- **Download**: Export OpenAPI spec
- **Theme**: Toggle dark/light mode

## ⚙️ Configuration

### Swagger UI Settings (in `index.html`)
```javascript
SwaggerUIBundle({
    url: "../openapi.json",           // OpenAPI spec location
    dom_id: '#swagger-ui',            // Mount point
    presets: [...],                   // UI components
    layout: "BaseLayout"              // Layout style
})
```

## 🌐 Accessing from Network

If you need to access from another machine:
- Replace `localhost` with your machine's IP
- Example: `http://192.168.1.100:8000/swagger/ui/`

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `API_DOCUMENTATION.md` | Overview and quick reference |
| `SWAGGER_SETUP.md` | Comprehensive API guide with examples |
| `backend/public/swagger/ui/README.md` | Swagger UI specific documentation |
| `backend/openapi/endpoints.php` | API endpoint annotations |

## 🐛 Troubleshooting

### Swagger UI not loading?
1. ✅ Verify Docker is running: `./docker.sh ps`
2. ✅ Check if openapi.json exists: `ls backend/public/swagger/openapi.json`
3. ✅ Refresh the page in browser
4. ✅ Check browser console for errors (F12)

### Can't access endpoints?
1. ✅ Ensure server is running: `./docker.sh up`
2. ✅ Wait 10 seconds for nginx to start
3. ✅ Try accessing `http://localhost:8000` first
4. ✅ Check logs: `./docker.sh logs app`

### Authentication not working?
1. ✅ Get a fresh access token from `/api/v1/auth/login`
2. ✅ Use format: `Bearer YOUR_TOKEN_HERE` (with the word "Bearer")
3. ✅ Tokens expire after 15 minutes
4. ✅ Use `/api/v1/auth/refresh` to get a new token

## 💡 Pro Tips

1. **Save Requests**: Swagger UI remembers your last requests
2. **Copy as cURL**: Responses can be copied to clipboard
3. **API Explorer**: Use the interface to explore all endpoints
4. **Real Data**: Test with actual data in your development environment
5. **Error Details**: Check response body for detailed error messages

## 🎓 Next Steps

1. ✅ Test the 9 authentication endpoints
2. ✅ Review the OpenAPI specification
3. ✅ Run the test suite to verify everything works
4. ✅ Add new endpoints following the same pattern
5. ✅ Update documentation when adding features

---

**Swagger UI URL**: `http://localhost:8000/swagger/ui/`
**API Spec URL**: `http://localhost:8000/swagger/openapi.json`
**Setup Date**: November 4, 2025
**Status**: ✅ Ready to use!

Enjoy interactive API documentation! 🚀
