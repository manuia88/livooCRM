# React Query Implementation Patterns

This project uses **React Query v5** for data fetching, caching, and state management, optimized for high-volume data in **Next.js 15**.

## 1. Pagination Pattern (Cursor-Based/Range)

All list-based hooks use Supabase `.range(from, to)` for efficient data fetching.

### Usage Example:
```typescript
const { data, isLoading } = useProperties({
  page: 1,
  pageSize: 20,
  status: 'active'
})
```

### Key Features:
- **`placeholderData: keepPreviousData`**: Ensures smooth transitions between pages by showing old data while the new page loads.
- **Server-Side Filters**: Search and filters are applied directly in the query for performance.

## 2. Prefetching for UX

Prefetching ensures the next page is already in cache before the user clicks.

```typescript
const prefetch = usePrefetchProperties()

// In useEffect or on hover
if (data?.hasMore) {
  prefetch({ page, ...filters })
}
```

## 3. Optimistic Updates

Mutations update the UI immediately before the server responds, providing a premium feel.

```typescript
const { mutate } = useCreateProperty()

mutate(newPropertyData) // UI updates instantly!
```

## 4. Dashboard Materialized Views

The dashboard uses a dedicated RPC call `get_user_dashboard` which reads from a materialized view, ensuring load times `< 50ms`.

## 5. Infinite Scrolling

For mobile-friendly or seamless feeds, use `useInfiniteProperties`.

```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteProperties({
  pageSize: 20
})
```

## Best Practices
- **`staleTime`**: Set to 2 mins for standard data, 1 min for dashboad metrics.
- **Cache Invalidation**: Use `onSettled` in mutations to invalidate relevant keys.
- **Query Keys**: Use structured keys like `['properties', { filters }]` for individual cache management.
