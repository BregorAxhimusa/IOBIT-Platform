# Deployment Guide

IOBIT mund të deploy në platforma të ndryshme. Ky dokument shpjegon procesin e deployment për secilën platformë.

## 🚀 Deployment Options

### 1. Vercel (Recommended)

Vercel është platforma më e lehtë për deployment të aplikacioneve Next.js.

#### Setup

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy to Preview**
```bash
vercel
```

4. **Deploy to Production**
```bash
vercel --prod
```

#### Environment Variables

Në Vercel Dashboard:
1. Project Settings → Environment Variables
2. Shto variablat nga `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

#### Auto Deployment

Vercel do të deploy automatikisht kur bën push në GitHub:
- `main` → Production deployment
- `development` → Preview deployment
- Feature branches → Preview deployment

---

### 2. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Compose (optional)

#### Using Docker Compose

1. **Build and Run**
```bash
docker-compose up -d
```

2. **Stop Containers**
```bash
docker-compose down
```

3. **View Logs**
```bash
docker-compose logs -f
```

#### Manual Docker Build

```bash
# Build image
docker build -t iobit-platform .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_db_url" \
  -e NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id" \
  iobit-platform
```

---

### 3. Custom Server (VPS/Dedicated)

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Nginx (optional, for reverse proxy)

#### Setup

1. **Clone Repository**
```bash
git clone https://github.com/BregorAxhimusa/IOBIT-Platform.git
cd IOBIT-Platform
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Build Application**
```bash
npm run build
```

5. **Start with PM2**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "iobit" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/iobit`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/iobit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 4. Netlify

1. **Connect Repository**
   - Go to Netlify Dashboard
   - New site from Git
   - Select IOBIT-Platform repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Add same variables as Vercel

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Environment variables are properly set
- [ ] Database is secured with strong password
- [ ] HTTPS is enabled (SSL certificate)
- [ ] CORS is properly configured
- [ ] API rate limiting is enabled
- [ ] Error logging is set up (Sentry, etc.)
- [ ] Security headers are configured
- [ ] Dependencies are updated (`npm audit fix`)
- [ ] Secrets are not committed to Git

---

## 📊 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Sentry** - Error tracking
3. **Google Analytics** - User analytics
4. **Uptime Robot** - Uptime monitoring

### Setup Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## 🔄 Update Deployment

### Vercel
```bash
git push origin main
# Vercel auto-deploys
```

### Docker
```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### PM2
```bash
git pull origin main
npm install
npm run build
pm2 restart iobit
```

---

## 🆘 Troubleshooting

### Build Failures

1. Check Node.js version: `node -v` (should be 18+)
2. Clear cache: `rm -rf .next node_modules && npm install`
3. Check environment variables
4. Review build logs

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is accessible from deployment server
3. Verify PostgreSQL connection limit

### Performance Issues

1. Enable Next.js caching
2. Optimize images with `next/image`
3. Use CDN for static assets
4. Enable compression in Nginx/server

---

## 📞 Support

For deployment issues:
- Check [GitHub Issues](https://github.com/BregorAxhimusa/IOBIT-Platform/issues)
- Review [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Contact team via email

---

Built with ❤️ by IOBIT Team
