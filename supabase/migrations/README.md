# Supabase Database Migrations

This directory contains the complete database schema for NEXUS OS Real Estate CRM.

## 📁 Migration Files

Apply migrations in **numerical order** via Supabase SQL Editor:

1. **0001_initial_schema.sql** (27.6 KB)
   - 50+ tables across 9 modules
   - Core system, properties, contacts, communications, etc.

2. **0002_functions_and_triggers.sql** (11.3 KB)
   - 8 database functions
   - 20+ automated triggers
   - Health score calculation, task auto-generation

3. **0003_indexes.sql** (13.4 KB)
   - 100+ performance indexes
   - Spatial indexes (PostGIS)
   - Full-text search indexes

4. **0004_rls_policies.sql** (18.8 KB)
   - Row Level Security on all tables
   - Multi-tenant isolation
   - Role-based access control

5. **0005_seed_data.sql** ⭐ NEW
   - Example seed data for testing
   - Sample agency, users, properties, contacts

## 🚀 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of each file in order
5. Run each query and verify no errors

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db reset
supabase migration up
```

## ✅ Verification Checklist

After applying migrations:

- [ ] All 50+ tables created
- [ ] Check Table Editor - all tables visible
- [ ] RLS enabled (shield icon on tables)
- [ ] Test a query: `SELECT * FROM agencies;`
- [ ] Test health score: `SELECT calculate_property_health_score('property-uuid');`
- [ ] Verify triggers: Update a property and check `updated_at` changed

## 🧪 Testing with Seed Data

After applying migrations 0001-0004, apply **0005_seed_data.sql** to get:

- 1 demo agency
- 2 demo users (admin and agent)
- 5 sample properties
- 3 sample contacts
- Example conversations and tasks

**Test credentials** (if using seed data):
- Email: admin@demo.com
- Email: agent@demo.com
- (Passwords need to be set via Supabase Auth)

## 📊 Database Overview

| Module | Tables | Description |
|--------|--------|-------------|
| Core | 6 | Agencies, users, teams, permissions |
| Properties | 6 | Property catalog with health scoring |
| Developments | 4 | Real estate projects |
| Owners | 3 | Property owners management |
| Contacts | 6 | CRM with lead scoring |
| Communications | 5 | Unified inbox (8 channels) |
| Tasks | 3 | Pulppo-style automation |
| Visits & Offers | 4 | Visit scheduling, offers, transactions |
| Analytics | 4 | Activity logs, performance metrics |

## 🔐 Security Notes

- **RLS Enabled**: All tables have Row Level Security
- **Multi-tenant**: Users only see data from their agency
- **Helper Functions**: 
  - `auth.user_agency_id()` - Get current user's agency
  - `auth.is_admin()` - Check if user is admin
  - `auth.has_permission(name)` - Check permissions

## 📖 Documentation

See [/docs/DATABASE.md](../docs/DATABASE.md) for:
- Complete schema documentation
- ER diagrams
- Common query examples
- Performance tips
- How to extend the schema

## 🆘 Troubleshooting

**Error: "extension postgis does not exist"**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Error: "RLS policies failing"**
- Ensure you're authenticated via Supabase
- Check that user has a record in `user_profiles`

**Error: "Function auth.uid() does not exist"**
- This is a Supabase built-in, ensure you're running in Supabase environment

## 🔄 Rollback

If you need to rollback:

```sql
-- WARNING: This will delete ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-apply migrations from scratch.

## 📝 Adding New Migrations

When extending the schema:

```bash
# Create new migration file
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
```

Follow the pattern in existing migrations.
