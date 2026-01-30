# SECURITY.md - NEXUS OS Security Documentation

**Last Updated:** 2026-01-30  
**Version:** 1.0  
**Team:** Equipo 1 - Authentication & Security

---

## 🛡️ Overview

NEXUS OS implements a **7-Layer Security System** to protect user data, prevent unauthorized access, and maintain comprehensive audit trails. This document explains how each layer works and how to use them properly.

---

## 🔐 Security Layers

### CAPA 1: Row Level Security (RLS)

**Purpose:** Protect data at the database level, ensuring users only see data from their agency.

**Implementation:** Supabase RLS policies on all tables

**Tables with RLS:**
- `user_profiles` - User roles and agency assignments
- `audit_logs` - Activity logging (users see own logs, admins see agency logs)

**How it works:**
```sql
-- Example: Users can only view profiles from their agency
CREATE POLICY "Users can view same agency profiles"
ON user_profiles FOR SELECT
USING (
  agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
);
```

**Helper Functions:**

```typescript
import { getUserProfile, requireRole } from '@/lib/security/rls-helpers'

// Get current user's profile
const profile = await getUserProfile()

// Require specific roles (throws error if unauthorized)
await requireRole(['admin', 'manager'])
```

---

### CAP A 2: Rate Limiting

**Status:** ⚠️ PENDING - Requires Upstash Redis configuration

**Purpose:** Prevent brute force attacks and API abuse

**Planned Implementation:**
- API calls: 100/minute per user
- Login attempts: 5/15 minutes per IP
- WhatsApp messages: 20/hour per user

**Setup Required:**
1. Create Upstash Redis account
2. Add environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token
   ```
3. Install dependencies: `npm install @upstash/redis @upstash/ratelimit`

---

### CAPA 3: CORS Configuration

**Status:** ⚠️ PENDING

**Purpose:** Control which domains can access your API

**Planned Configuration in `next.config.ts`:**
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://nexusos.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' }
      ]
    }
  ]
}
```

---

### CAPA 4: Input Validation

**Purpose:** Validate all user inputs to prevent injection attacks

**Implementation:** Zod schemas + React Hook Form

**Validation Schemas:**

```typescript
import { loginSchema, registerSchema } from '@/lib/validations/auth'

// Login validation
const loginData = loginSchema.parse({
  email: 'user@example.com',
  password: 'SecurePass123!'
})

// Register validation
const registerData = registerSchema.parse({
  fullName: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  confirmPassword: 'SecurePass123!'
})
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Usage in Components:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validations/auth'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
})
```

---

### CAPA 5: Encryption

**Implementation:** Handled by Supabase Auth

**What's Encrypted:**
- Passwords: bcrypt with auto salt
- JWT tokens: HS256 algorithm
- Cookies: Encrypted by Next.js

**HTTPS:** Forced in production via Strict-Transport-Security header

---

### CAPA 6: Audit Logging

**Purpose:** Track all critical actions for security and compliance

**Implementation:** `audit_logs` table with automatic IP and user agent capture

**Logged Actions:**
- `login` - User authentication
- `logout` - Session termination
- `register` - New user registration
- `create_property` - Property creation
- `update_property` - Property updates
- `delete_property` - Property deletion

**Usage:**

```typescript
import { logAudit } from '@/lib/security/audit-log'

// Log an action
await logAudit({
  action: 'create_property',
  resourceType: 'property',
  resourceId: propertyId,
  newValues: { title: 'New Property', price: 300000 }
})
```

**View Audit Logs:**

Users can see their own logs, admins can see all logs from their agency:

```typescript
const supabase = await createClient()
const { data } = await supabase
  .from('audit_logs')
  .select('*')
  .order('created_at', { ascending: false })
```

---

### CAPA 7: Security Headers

**Purpose:** Protect against XSS, clickjacking, and other browser-based attacks

**Implemented Headers:**

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `X-XSS-Protection` | 1; mode=block | Enable XSS filtering |
| `Referrer-Policy` | strict-origin-when-cross-origin | Control referrer info |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=(self) | Restrict browser features |
| `Strict-Transport-Security` | max-age=63072000 | Force HTTPS (production only) |
| `Content-Security-Policy` | ... | Restrict resource loading (production only) |

**Implementation:** Automatically applied in `middleware.ts`

---

## 🔧 Setup Instructions

### 1. Apply Supabase Migrations

Run the SQL migrations in Supabase Dashboard → SQL Editor:

1. **001_user_profiles.sql** - Creates user profiles table with RLS
2. **002_audit_logs.sql** - Creates audit logging table

Or use Supabase CLI:
```bash
supabase db push
```

### 2. Verify Tables Created

Go to Supabase Dashboard → Table Editor and verify:
- ✅ `user_profiles` table exists
- ✅ `audit_logs` table exists
- ✅ RLS is enabled on both tables
- ✅ Triggers are active

### 3. Test Existing User

For users created before migrations, manually insert into `user_profiles`:

```sql
INSERT INTO user_profiles (id, full_name, agency_id, role)
VALUES (
  'your-user-id',
  'Manuel Acosta',
  '00000000-0000-0000-0000-000000000001',
  'admin'
);
```

---

## 🚨 Troubleshooting

### Issue: "No rows found" when querying protected tables

**Cause:** User doesn't have a profile in `user_profiles`

**Solution:**
1. Check if profile exists:
   ```sql
   SELECT * FROM user_profiles WHERE id = auth.uid();
   ```
2. If missing, insert manually (see above)

### Issue: Audit logs not appearing

**Cause:** Function might be failing silently

**Solution:**
1. Check Supabase logs in Dashboard
2. Verify `user_profiles` exists for the user
3. Ensure audit logging function doesn't throw errors

### Issue: Security headers not showing

**Cause:** Headers only set in production for some (HSTS, CSP)

**Solution:**
- In development: Check with `curl -I http://localhost:3000`
- Some headers (HSTS, CSP) only active when `NODE_ENV=production`

---

## 📋 Security Checklist

Before deploying to production:

- [x] Security headers implemented
- [x] Input validation with Zod
- [ ] RLS policies tested with multiple users
- [ ] Audit logging verified
- [ ] Rate limiting configured (pending Upstash)
- [ ] CORS configured with production domain
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Supabase RLS policies enabled
- [ ] Service role key never exposed to client

---

## 🔄 Adding New Roles

To add a new role:

1. Update check constraint in `user_profiles` table:
   ```sql
   ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
   ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
     CHECK (role IN ('admin', 'manager', 'agent', 'assistant', 'viewer'));
   ```

2. Update RLS policies if needed
3. Update TypeScript types in `rls-helpers.ts`

---

## 📞 Support

For security issues or questions:
- **Team:** Equipo 1 - Authentication & Security
- **Documentation:** This file
- **Supabase Docs:** https://supabase.com/docs/guides/auth
