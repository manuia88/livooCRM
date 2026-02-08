# Database Performance Documentation

This document outlines the performance strategy and optimizations implemented in Livoo CRM to handle 100,000+ properties and 50,000+ contacts.

## Performance Stack

1.  **Optimized Indexes**: Composite, Spatial (GIST), and Full-Text Search (GIN) indexes.
2.  **Materialized Views**: Cached metrics for dashboard loading.
3.  **Optimized SQL Functions**: Unified search and analytics functions for reduced network overhead and better query planning.

## 1. Indexes

We have implemented a series of indexes to cover the most common search patterns.

### Properties Table
- `idx_properties_agency_status_type`: Composite index for filtering properties by agency, status, and type.
- `idx_properties_agency_created_at`: Optimized for sorting properties by date within an agency.
- `idx_properties_coordinates_gist_spatial`: GIST index for high-performance radius searches.
- `idx_properties_fulltext_search_gin`: GIN index for full-text search in Spanish across title, description, and address.

### Contacts & Tasks
- `idx_contacts_agency_status_comp`: Fast filtering for contact stages.
- `idx_tasks_agency_status_due_date`: Optimized for pending task lists and dashboard counters.

---

## 2. Materialized Views

### `dashboard_metrics_cache`
This view pre-calculates essential metrics for each agency's dashboard.

**Columns:**
- `agency_id`: Unique identifier for the agency.
- `properties_active`: Count of active properties.
- `leads_hot`: Count of leads with score >= 80.
- `tasks_pending`: Count of non-completed tasks.

**Refresh Policy:**
The view should be refreshed periodically (e.g., every 5 minutes).
```sql
SELECT refresh_dashboard_metrics();
```

---

## 3. SQL Functions

### `search_properties()`
The primary way to search properties. It combines filters, full-text search, and geographic sorting into a single high-performance call.

**Usage Example:**
```sql
SELECT * FROM search_properties(
  'agency-uuid',
  'casa en polanco', -- Full-text search
  'active',          -- Status
  'house',           -- Type
  'sale',            -- Operation
  1000000, 5000000,  -- Price range
  3,                 -- Min bedrooms
  NULL,              -- Min bathrooms
  19.4326, -99.1332  -- Latitude, Longitude (for radial sort)
);
```

### `get_user_dashboard(p_user_id)`
Retrieves cached dashboard metrics for a user's agency.
- **Latency**: < 50ms (from materialized view).

---

## 4. Maintenance Plan

To keep performance at peak levels, the following maintenance is recommended:

-   **Refresh Metrics**: Schedule `refresh_dashboard_metrics()` to run via `pg_cron` or a background worker every 5-15 minutes.
-   **Analyze Tables**: Run `ANALYZE properties; ANALYZE contacts;` after large bulk imports to update query planner statistics.
-   **Vacuum**: Standard PostgreSQL autovacuum should handle cleanup, but manual `VACUUM ANALYZE` may be beneficial after deleting >20% of a table's rows.

---

## 5. Performance Metrics (Target)

| Query Type | Target Latency | Status |
| :--- | :--- | :--- |
| Unified Search | < 100ms | 🟢 |
| Dashboard Load | < 50ms | 🟢 |
| Geographic Search | < 200ms | 🟢 |
| Full-Text Search | < 150ms | 🟢 |
