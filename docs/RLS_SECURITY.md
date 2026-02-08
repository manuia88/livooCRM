# RLS Security Architecture - Livoo CRM

This document outlines the security model implemented using PostgreSQL Row Level Security (RLS) and Supabase Auth.

## Overview

The system uses a **multi-tenant** architecture where records are partitioned by `agency_id`. Data isolation is enforced at the database level, ensuring that users can only access data belonging to their agency.

## Security Controls

### Core Identity
Each user profile is linked to an `agency_id` and a `role` (`admin`, `manager`, `agent`).

### Helper Functions
- `auth.get_user_agency_id()`: Securely retrieves the current user's agency reference.
- `auth.is_admin_or_manager()`: Determines if the user has elevated privileges within their agency.

## Policy Rules

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **Properties** | Agency (Admins) / Assigned+Produced (Agents) | Agency | Agency (Admins) / Produced (Agents) | Agency (Admins) |
| **Contacts** | Agency (Admins) / Assigned (Agents) | Agency | Agency (Admins) / Assigned (Agents) | Agency (Admins) |
| **Tasks** | Agency (Admins) / Assigned+Created (Agents) | Agency | Agency (Admins) / Assigned+Created (Agents) | Agency (Admins) |
| **Interactions** | Visibility based on Contact | Agency | Read-only | Read-only |
| **User Profiles** | Agency | Restricted | Self / Agency (Admins) | Restricted |

## Implementation Details

All policies follow the pattern:
```sql
USING (agency_id = auth.get_user_agency_id() AND (role_logic))
```

This ensures that even if application logic leaks a query, the database will refuse to return data from another tenant.

## Troubleshooting

If you encounter `403 Forbidden` or empty results:
1. Verify that the user has a record in `user_profiles`.
2. Ensure the `agency_id` in the profile matches the record you are trying to access.
3. Check if the user's role allows the specific operation.
