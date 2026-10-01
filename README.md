# Table component

A reusable React data table with sorting, pagination, row selection, expandable rows, pinned columns and a sticky header. It works with data that's all in the browser or with data paged and sorted by a server.

## Setup

You need Node 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. There's no backend to run, because the API is mocked in the browser with [MSW](https://mswjs.io). The demo pages are `/client-side`, `/server-side` and `/ecommerce-store`.

Other scripts: `npm run typecheck`, `npm run lint`, `npm run build`.

- **Live URL:** [Live URL](https://table-component-wine.vercel.app/)
- **Stack:** React 19, TypeScript, Vite, Tailwindcss , Tanstack Query

## Mock API (MSW)

There's no real backend. [MSW](https://mswjs.io) runs a service worker in the browser that answers the app's `/api/*` requests, so the requests show up in the Network tab like real ones.

- **Startup:** `main.tsx` starts the worker before the app renders, so the first request is already mocked. It runs in every build, not just in dev, so a deployed build works as a demo too.
- **Handlers:** `src/mocks/handlers.ts` covers four endpoints: `/api/classes`, `/api/classes/:id/attendees`, `/api/stores` and `/api/stores/:id/stocks`. Each one reads `page`, `size` and `sort` from the URL, then sorts and slices the data like a real API would. It returns the page plus a `total`, and a 400 for invalid params.
- **Data:** generated with faker using a fixed seed (`src/mocks/db.ts`), so it's the same on every reload.
- **Network controls:** the bar at the top of the page changes how the mock behaves: latency, random or forced errors (400, 404, 500 or a network failure) and empty results, for all endpoints or just one. The settings are saved to localStorage, so a reload keeps them. I used this to test the table's loading, error and empty states.

## Using the table

```tsx
import { Table } from "@/components/Table";

<Table
    ariaLabel="Fitness classes"
    columns={columns}
    data={classes}
    getRowIdFn={(row) => row.id}
/>;
```

`ariaLabel`, `columns`, `data` and `getRowIdFn` are required. Everything else is optional, and passing a prop turns that feature on:

| Prop                             | What it does                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `pagination`                     | `{ value, changeFn, pageSizeOptions, isManual }`, shows the pagination bar         |
| `sorting`                        | `{ value, changeFn, isMultiSort, isManual }`, makes `isSortable` headers clickable |
| `selection`                      | `{ value, changeFn }`, adds a checkbox column                                      |
| `renderExpandedFn`               | `({ row }) => ReactNode`, adds an expand chevron and a panel under each row        |
| `expansion`                      | `{ value, changeFn }`, controls which rows are expanded                            |
| `isLoading`                      | shows skeleton rows                                                                |
| `isError`, `error`, `retryFn`    | shows an error row with a Retry button                                             |
| `renderErrorFn`, `renderEmptyFn` | replace the default error and empty states                                         |
| `isHeaderSticky`, `maxHeight`    | keep the header visible while the body scrolls                                     |
| `skeletonRows`                   | number of skeleton rows (defaults to the page size)                                |

**Controlled or not.** `pagination`, `sorting`, `selection` and `expansion` all take `{ value, changeFn }`. If you pass `changeFn`, you own the state and the table shows your `value`. If you leave it out, `value` is just the starting value and the table keeps the state itself.

**Server-side data.** Set `isManual: true` on `pagination` and/or `sorting`. The table then shows `data` as it is (already the current page, already in order) and reports changes through `changeFn`, so you can fetch the next page:

```tsx
<Table
    data={data?.data ?? []}
    pagination={{
        value: { ...pagination, total: data?.pagination.total ?? 0 },
        changeFn: setPagination,
        isManual: true,
    }}
    sorting={{ value: sorts, changeFn: setSorts, isManual: true }}
    isLoading={isLoading}
    isError={isError}
    error={error}
    retryFn={refetch}
    // ...columns, ariaLabel, getRowIdFn
/>
```

**Expandable rows.** Return the panel content from `renderExpandedFn` (see [Expandable rows](#expandable-rows) below).

```tsx
renderExpandedFn={({ row }) => <AttendeeTable classId={row.id} />}
```

## ColumnDef

Columns are an array of `ColumnDef<T>`, where `T` is the row type:

```tsx
import type { ColumnDef } from "@/components/Table";

const columns: ColumnDef<FitnessClass>[] = [
    { id: "name", header: "Class", dataKey: "name", pinned: "left", width: 200, isSortable: true },
    {
        id: "startsAt",
        header: "Starts",
        dataKey: "startsAt",
        isSortable: true,
        cell: ({ value }) => value.toLocaleString(),
    },
    { id: "spots", header: "Spots", dataKey: "spots", align: "right" },
];
```

`dataKey` must be a key of `T`, so a typo is a compile error. The `value` passed to `cell` has that field's type (here, a `Date`). Without `cell`, the value is shown as text.

For a column that isn't one field, like row actions, leave out `dataKey`. `cell` is then required:

```tsx
{ id: "actions", header: "", cell: ({ row }) => <EditButton id={row.id} /> }
```

| Option                             | Description                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `id`                               | Required. Unique column id; also the sort key sent to the server                                 |
| `header`                           | Required. Header content (any `ReactNode`)                                                       |
| `dataKey`                          | The row field to show                                                                            |
| `cell`                             | `({ row, value }) => ReactNode`, custom cell content                                             |
| `width`                            | Fixed width: a number (px) or a CSS length like `"20%"`                                          |
| `minWidth`                         | For columns without `width`: the narrowest it gets before the table scrolls sideways             |
| `pinned`                           | `"left"` or `"right"`, keeps the column visible when scrolling sideways. Needs a numeric `width` |
| `align`                            | `"left"`, `"center"` or `"right"`                                                                |
| `isSortable`                       | Makes the header clickable to sort                                                               |
| `isWrapped`                        | Wraps long text instead of cutting it off with "…"                                               |
| `headerClassName`, `cellClassName` | Extra classes for the header and body cells                                                      |

## Expandable rows

Every row gets a chevron when you pass `renderExpandedFn`. The table only gives you the row, so the same prop covers both kinds of child rows:

- **Inline:** the child data is already on the row. On `/client-side`, each class carries its attendees, and the panel renders a nested client-side `Table` from `row.attendees`.
- **On demand:** the panel renders a component that fetches its own data, such as `<Attendee id={row.id} />` on `/server-side` or `<StockTable id={row.id} />` on `/ecommerce-store`. That component is a full table with its own pagination, sorting, loading and error states.

A panel is only mounted when its row is expanded for the first time, so a page of collapsed rows sends no requests. After that it stays mounted. Collapsing it can animate, and reopening it doesn't refetch or reset the child table's page.

Which rows are open is stored in the table by row id, not inside each row, so an open row stays open when you page away and back. Pass `expansion={{ value, changeFn }}` if you need to control it, for example to open a row on load.

## Sticky columns

Set `pinned: "left"` or `"right"` on a column, together with a numeric `width`.

- Pinned columns are moved to their edge of the table. Inside each group, the order you wrote them in is kept.
- Each pinned cell uses `position: sticky`. Its offset is the sum of the widths of the pinned columns between it and the edge, which is why `width` must be a number of pixels.
- When there are left-pinned columns, the checkbox and chevron columns stick as well, so they don't scroll away underneath.
- Pinned cells get a solid background that follows the row's hover and expanded colors. The last pinned column draws a divider with an inset `box-shadow`, because a border doesn't stay with a sticky cell.

The sticky header works the same way vertically. It needs `maxHeight`, so the table body has something to scroll in.

## State management

There are two kinds of state, and each is handled differently.

**Server data: React Query.** Data from the API is remote state: it can be loading, can fail, can go stale, and gets shared across components. TanStack Query is built for exactly that, so I didn't write it by hand:

- **Caching by query key.** The key includes the page and the sorts (`["classes", { page, size, sorts }]`), so every page/sort combination is cached. Going back to a page you've already seen is instant.
- **Freshness.** Data counts as fresh for 5 minutes (`staleTime`). After that it's refetched in the background, and the old data stays on screen meanwhile.
- **Retries.** A failed request is retried up to 3 times, except for 4xx errors, since retrying a bad request gives the same answer.
- **Request status.** `isLoading`, `isError`, `error` and `refetch` go straight into the table's `isLoading`, `isError`, `error` and `retryFn`.
- **Shared requests.** Identical requests are deduplicated, and each nested child table gets its own cache entry.

Adding Redux or Zustand on top would only duplicate what React Query already does.

**Table UI state: local, optionally controlled.** Pagination, sorting, selection and expansion all use the same shape:

```ts
type Controlled<V> = { value?: V; changeFn?: (value: V) => void };
```

If you pass `changeFn`, the parent owns the state. If you don't, the table keeps it internally, using `value` as the starting point.

- The client-side demo leaves paging and sorting to the table, so it needs no wiring.
- The server-side pages lift paging and sorting into the page, because they're part of the query key.

Inside the table, each feature is a small hook built on `useControllableState`, and `useTable` combines them. Derived values such as "is every row on this page selected" are calculated on each render instead of stored, so they can't drift out of sync.
