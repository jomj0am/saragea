# SARAGEA - Modern Apartment Management Platform

![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.8.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql)

## 🌟 Overview

SARAGEA is a comprehensive, multi-tenant apartment management platform designed to streamline the entire rental lifecycle. From property discovery and digital leasing to ongoing tenancy management and maintenance coordination, SARAGEA provides a seamless experience for both residents and property administrators.

### 🎯 Vision

To transform apartment living through technology, creating connected communities and efficient property management ecosystems.

## ✨ Features

### 🏠 For Residents

- **Digital Leasing**: Complete onboarding with e-signature support
- **Smart Dashboard**: Real-time lease, payment, and maintenance overview
- **Maintenance Management**: Priority-based ticket submission with photo uploads
- **Integrated Payments**: Multiple payment gateway support (Selcom, Pesapal, Flutterwave)
- **Community Communication**: Real-time chat with property administration
- **Document Repository**: Secure storage for leases, receipts, and communications

### 🛠️ For Administrators

- **Dynamic CMS**: Real-time content management without deployments
- **Financial Operations**: Automated invoicing, payment tracking, and receipt generation
- **Property Analytics**: Occupancy rates, revenue metrics, and performance dashboards
- **Multi-language Support**: Full i18n for English, French, and Swahili
- **Audit Trail**: Comprehensive logging of all system activities
- **Role-based Access**: Granular permissions for staff management

### 🏢 For Property Owners

- **Portfolio Overview**: Multi-property management from single dashboard
- **Financial Reporting**: Customizable reports and export capabilities
- **Market Insights**: Competitive analysis and pricing recommendations
- **Automated Operations**: Scheduled maintenance and compliance tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL 14 or later
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/saragea/apartment-management.git
cd saragea
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Initialize database**

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── [locale]/          # Internationalized routing
│   │   ├── (admin)/       # Admin dashboard (protected)
│   │   ├── (dashboard)/   # Tenant dashboard (protected)
│   │   ├── (marketing)/   # Public marketing pages
│   │   └── api/           # API routes
│   ├── api/               # Global API routes
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── forms/            # Form components
│   ├── charts/           # Data visualization
│   └── layout/           # Layout components
├── lib/                  # Utilities and shared logic
│   ├── auth/            # Authentication helpers
│   ├── db/              # Database utilities
│   ├── i18n/            # Internationalization
│   └── utils/           # Common utilities
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Prisma schema
│   └── seeds/          # Database seed data
└── messages/           # Translation files
    ├── en.json
    ├── fr.json
    └── sw.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saragea"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# Payment Gateways
SELCOM_API_KEY=""
SELCOM_API_SECRET=""
PESAPAL_CONSUMER_KEY=""
PESAPAL_CONSUMER_SECRET=""
FLUTTERWAVE_PUBLIC_KEY=""
FLUTTERWAVE_SECRET_KEY=""

# File Storage
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Real-time Communication
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="noreply@saragea.com"

# Admin
ADMIN_EMAIL="admin@saragea.com"
ADMIN_INITIAL_PASSWORD="ChangeThisImmediately"
```

### Database Setup

1. **Using Docker (Recommended)**

```bash
docker-compose up -d postgres
npm run db:migrate
npm run db:seed
```

2. **Manual Setup**

```sql
CREATE DATABASE saragea;
CREATE USER saragea_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE saragea TO saragea_user;
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker build -t saragea .
docker run -p 3000:3000 --env-file .env.production saragea
```

### Docker Compose (Full Stack)

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: saragea
      POSTGRES_USER: saragea
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://saragea:${DB_PASSWORD}@postgres:5432/saragea
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/session      # Session verification
POST /api/auth/logout       # User logout
```

### Property Management

```
GET    /api/properties      # List properties
POST   /api/properties      # Create property
GET    /api/properties/:id  # Get property details
PUT    /api/properties/:id  # Update property
DELETE /api/properties/:id  # Delete property
```

### Lease Management

```
GET    /api/leases          # List leases
POST   /api/leases          # Create lease
GET    /api/leases/:id      # Get lease details
PUT    /api/leases/:id      # Update lease
POST   /api/leases/:id/sign # Sign lease digitally
```

### Payment Processing

```
POST   /api/payments/initialize  # Initialize payment
POST   /api/payments/webhook     # Payment webhook
GET    /api/payments/:id         # Payment status
GET    /api/invoices             # List invoices
POST   /api/invoices/generate    # Generate invoice
```

### Maintenance Tickets

```
GET    /api/tickets          # List tickets
POST   /api/tickets          # Create ticket
GET    /api/tickets/:id      # Ticket details
PUT    /api/tickets/:id      # Update ticket
POST   /api/tickets/:id/assign # Assign technician
```

## 🔐 Security Features

- **JWT-based Authentication** with refresh tokens
- **Role-based Access Control** (RBAC) with fine-grained permissions
- **Rate Limiting** on API endpoints
- **SQL Injection Prevention** via Prisma ORM
- **XSS Protection** with Content Security Policy
- **CORS Configuration** for cross-origin requests
- **Audit Logging** of all sensitive operations
- **Two-Factor Authentication** (optional)
- **Data Encryption** at rest and in transit

## 📱 Mobile Responsiveness

The application is fully responsive across all device sizes:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🌐 Internationalization

Supported languages:

- **English** (default)
- **French** (Français)
- **Swahili** (Kiswahili)

Adding a new language:

```bash
# 1. Create translation file
cp messages/en.json messages/es.json

# 2. Update i18n configuration
# 3. Add language selector in UI
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 📊 Monitoring & Analytics

### Built-in Analytics

- **User Engagement**: Page views, session duration, feature usage
- **Performance Metrics**: API response times, error rates
- **Business Metrics**: Occupancy rates, revenue tracking, maintenance response times

### Integration with

- **Google Analytics 4**
- **Sentry** for error tracking
- **LogRocket** for session replay
- **PostHog** for product analytics

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run deploy:production
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode
- Write comprehensive tests
- Update documentation
- Follow commit message conventions

## 📄 License

This project is proprietary software. All rights reserved.

Copyright © 2024 SARAGEA Technologies. Unauthorized copying, distribution, or use is prohibited.

## 🆘 Support

### Documentation

- [User Guide](docs/USER_GUIDE.md)
- [Admin Manual](docs/ADMIN_MANUAL.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

### Contact

- **Email**: support@saragea.com
- **Slack**: [Join our workspace](https://saragea.slack.com)
- **Issues**: [GitHub Issues](https://github.com/saragea/apartment-management/issues)

### Service Status

Check our [status page](https://status.saragea.com) for uptime and incident reports.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Prisma](https://prisma.io) - Database ORM
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [MapLibre](https://maplibre.org) - Mapping library
- [Pusher](https://pusher.com) - Real-time features

---

**SARAGEA** - Redefining apartment living through technology.
