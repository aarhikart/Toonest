# Production Deployment & Operations Guide

## 1. Architecture Overview
```text
                HTTPS Requests / Meta Webhooks
                             │
                             ▼
                ┌─────────────────────────┐
                │ Nginx / Cloudflare SSL  │
                └────────────┬────────────┘
                             │
                             ▼
                ┌─────────────────────────┐
                │ Next.js Web App (3000)  │
                └─────┬─────────────┬─────┘
                      │             │
              SQL Ops │             │ Enqueue Jobs
                      ▼             ▼
              ┌──────────────┐ ┌───────────────┐
              │ PostgreSQL   │ │ Redis Queue   │
              │ Database     │ │ (Port 6379)   │
              └──────▲───────┘ └───────┬───────┘
                     │                 │
                     │                 ▼
                     │        ┌────────────────┐
                     └────────┤ Worker Service │
                              └────────────────┘
```

## 2. Environment Variables Checklist
Create a `.env.production` file with:
```bash
DATABASE_URL="postgresql://whatsapp_user:whatsapp_secure_pass@postgres:5432/whatsapp_marketing?schema=public"
REDIS_URL="redis://redis:6379"

# Meta Developer App Settings
META_APP_ID="your_meta_app_id"
META_APP_SECRET="your_meta_app_secret"
META_WEBHOOK_VERIFY_TOKEN="your_custom_secure_verify_token_here"

# WhatsApp Cloud API
WHATSAPP_API_VERSION="v21.0"
WHATSAPP_API_BASE_URL="https://graph.facebook.com"

NEXTAUTH_SECRET="secure_random_64_char_secret_key"
```

## 3. Database Backup & Disaster Recovery
### Automated Daily Backup via pg_dump
```bash
# Create backup directory
mkdir -p /backups/postgres

# Run pg_dump in docker container
docker exec -t toolnest-postgres pg_dump -U whatsapp_user whatsapp_marketing | gzip > /backups/postgres/whatsapp_db_$(date +%Y%m%d_%H%M%S).sql.gz

# Restore procedure
gunzip -c /backups/postgres/whatsapp_db_20260913_000000.sql.gz | docker exec -i toolnest-postgres psql -U whatsapp_user -d whatsapp_marketing
```

## 4. Webhook Security Verification
Meta requires:
1. **GET Verification**: Returns `hub.challenge` when `hub.verify_token` matches `META_WEBHOOK_VERIFY_TOKEN`.
2. **POST Payload Verification**: Validates `X-Hub-Signature-256` using HMAC-SHA256 with `META_APP_SECRET`.
