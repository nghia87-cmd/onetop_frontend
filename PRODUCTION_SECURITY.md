# Production Deployment Security Checklist

## 🔐 Critical Security Configuration

### 1. Environment Variables (MUST SET)

#### Frontend (.env.production)
```bash
# API Connection
API_URL=https://api.yourdomain.com
NODE_ENV=production

# Session Secret (CRITICAL - Use Secrets Manager)
SESSION_SECRET=<generate-strong-random-secret-64-chars>

# Analytics (Optional)
ANALYTICS_ID=your-analytics-id
```

#### Backend (.env.production)
```python
# Django Core
SECRET_KEY=<generate-django-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# Database (Use managed service)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CORS & CSRF (CRITICAL)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis (for Celery & Channels)
REDIS_URL=redis://your-redis-host:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=<email-password>

# Security
WEBSOCKET_TICKET_EXPIRY=10  # seconds
```

---

## 🚀 Deployment Steps

### Step 1: Generate Secrets
```bash
# Generate Django SECRET_KEY
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Generate SESSION_SECRET (64 chars)
openssl rand -base64 48
```

### Step 2: Database Migration
```bash
# Backend
cd onetop_backend
python manage.py migrate
python manage.py collectstatic --noinput
```

### Step 3: Frontend Build
```bash
# Frontend
cd onetop_frontend
npm run build
```

### Step 4: Security Headers (Nginx/Caddy)
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Frontend (Remix)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## ✅ Pre-Deployment Verification

### Security Checks
- [ ] `NODE_ENV=production` set (enables secure cookies)
- [ ] `DEBUG=False` in Django
- [ ] Strong `SECRET_KEY` and `SESSION_SECRET` (not defaults)
- [ ] `CORS_ALLOWED_ORIGINS` only includes production domains
- [ ] `CSRF_TRUSTED_ORIGINS` matches frontend domain
- [ ] `ALLOWED_HOSTS` configured correctly
- [ ] SSL/TLS certificate valid (HTTPS)
- [ ] Database connection uses SSL
- [ ] Redis connection secured

### Cookie Configuration Verification
```javascript
// Check in browser DevTools > Application > Cookies
// Should see:
_session: {
  HttpOnly: true,    // ✅ CRITICAL
  Secure: true,      // ✅ HTTPS only
  SameSite: Lax,     // ✅ CSRF protection
  Domain: yourdomain.com
}
```

### CSRF Verification
```bash
# Test CSRF protection
curl -X POST https://api.yourdomain.com/api/v1/critical-endpoint/ \
  -H "Origin: https://malicious-site.com" \
  -H "Cookie: sessionid=..." \
  --fail

# Should return 403 Forbidden
```

---

## 🔒 Post-Deployment Security

### 1. Enable Rate Limiting (Backend)
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

### 2. Set up Monitoring
- [ ] Enable error tracking (Sentry)
- [ ] Monitor failed login attempts
- [ ] Alert on suspicious activity
- [ ] Log WebSocket connection failures

### 3. Regular Security Updates
```bash
# Check for vulnerabilities
npm audit
pip-audit

# Update dependencies quarterly
npm update
pip install --upgrade -r requirements.txt
```

---

## 🚨 Security Incident Response

### If Session Secret is Compromised:
1. Generate new `SESSION_SECRET`
2. Deploy immediately
3. All users will be logged out (acceptable)
4. Investigate breach source

### If CSRF Attack Detected:
1. Review `CSRF_TRUSTED_ORIGINS`
2. Check Nginx/proxy logs for suspicious Origins
3. Consider stricter `SameSite=Strict` for critical operations

---

## 📞 Support Contacts

**Security Issues**: security@yourdomain.com
**Technical Support**: support@yourdomain.com

---

**Last Updated**: December 7, 2025
**Review Frequency**: Quarterly
