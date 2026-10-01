# Table component review

A review of [`src/components/Table`](../src/components/Table) as a reusable component: prop naming, types and architecture. Function props follow one rule: they end in `Fn` (e.g. `retryFn`).

Sections are ordered most important first. Tick items off as you fix them.

## 1. Bugs

- [ ] **Crash when `getRowId` is left out.** `TableProps.getRowId` is optional, but [Table.tsx](../src/components/Table/Table.tsx) passes `getRowId!` to `TableRow`. [TableRow.tsx](../src/components/Table/TableRow.tsx) calls it for the expand button's `aria-label` on every row. A table with `renderExpandUI` and no `getRowId` throws `getRowId is not a function`. Every current use passes it, which is why it hasn't shown up yet.
  - **Fix:** make `getRowId` required (simplest), or default it to `(row) => row.id`.
- [ ] **Row keys ignore `getRowId`.** Table.tsx builds keys with `"id" in row ? String(row.id) : rowIndex`.
  - **Fix:** use `getRowId(row)`.
- [ ] **`stickyHeader` does nothing without `maxHeight`.** The scroll area only scrolls vertically when `maxHeight` is set, so the header has nothing to stick to.
  - **Fix:** require the two together in the type, or document it on the prop.
- [ ] **Unused generic `K`** on `TableProps`, `TableRowProps`, `Table` and `TableRow`. This causes the 2 errors `npm run typecheck` reports in [table.types.ts](../src/types/table.types.ts).
  - **Fix:** remove `K` everywhere.
- [ ] **Leftovers to delete:**
  - `console.log` and `selectedIdsss` in [useSelection.tsx:32-33](../src/components/Table/hooks/useSelection.tsx)
  - unused `renderExpansion?: () => void` in `TableRowProps`
  - commented-out `expandKey` code in Table.tsx, TableRow.tsx and table.types.ts
  - `{/* create export btn that */}` in Table.tsx

## 2. Naming

### Function props: one rule, applied everywhere

Every function prop ends in `Fn`. The prefix says what kind of function it is.

| Kind | Pattern | Current → new |
|---|---|---|
| Reports new state | `<state>ChangeFn` | `onChangeHandler` → `paginationChangeFn`<br>`onChangeSort` → `sortChangeFn`<br>`onChangeSelect` → `selectionChangeFn` |
| Action | `<verb>Fn` | `onRetry` → `retryFn` |
| Returns UI | `render<Thing>Fn` | `renderExpandUI` → `renderExpandedFn`<br>`renderError` → `renderErrorFn`<br>`renderEmpty` → `renderEmptyFn` |
| Derives a value | `get<Thing>Fn` | `getRowId` → `getRowIdFn` |
| Internal props | same rules | `onSelectCallback` → `toggleSelectFn`<br>`onClickSort` → `toggleSortFn`<br>`onPageChange` → `pageChangeFn`<br>`onSizeChange` → `sizeChangeFn` |

- [x] Rename the public props (`TableProps` and the option types).
- [x] Rename the internal props (`TableRow`, `TableHeaderCell`, `Pagination`, the hooks).

Right now there are four styles: `onChangeHandler`, `onChangeSort`, `onSelectCallback` and `onPageChange`. Most React libraries use `onX` for callbacks and `renderX` for render props. `Fn` works fine as a team rule; what matters is applying it to every prop.

### Render functions: one argument shape

- [x] `renderExpandUI({ row })` takes an object, but `renderError(error, retry)` takes positional arguments. Use an object everywhere, so you can add fields later without breaking callers:
  ```ts
  renderExpandedFn?: (args: { row: T }) => ReactNode;
  renderErrorFn?: (args: { error: Error | null | undefined; retryFn?: () => void }) => ReactNode;
  renderEmptyFn?: () => ReactNode;
  ```

### Booleans: `is` / `has` + adjective

- [x] Use one form for all of them:

| Current | New |
|---|---|
| `isEnableSelect` | `isSelectable` |
| `isMultiple` | `isMultiSort` |
| `manual` | `isManual` |
| `stickyHeader` | `isHeaderSticky` |
| `sortable` (column) | `isSortable` |
| `wrap` (column) | `isWrapped` |

### One word per concept

- [x] **Selection:** the code mixes "check" (`toggleCheck`, `check`, `unCheck`, `isChecked`, `isAlreadyChecked`) with "select" (`selectedIds`, `selectAll`). Use "select" only: `toggleSelect`, `isSelected(id)`, `selectAll`, `deselectAll`. Delete `check` and `unCheck`; nothing uses them.
- [x] **Sorting:** the prop is `sorting.sorts`, the hook returns `sorting`, and `TableHeaderCell` takes `sorts`. Use `sorts` for the array everywhere.
- [x] **Pagination:** `pagination={{ pagination: … }}` repeats the word. Section 3 fixes this.

## 3. Public API: one shape for every controllable feature

Pagination, sorting and selection are all state that either the table owns or the parent controls. Today each one has a different shape (`pagination.pagination`, `sorting.sorts`, `selection.selectedIds`). Give them all the same one:

```ts
type Controlled<V> = {
    value?: V;          // controlled
    defaultValue?: V;   // uncontrolled starting value
    changeFn?: (value: V) => void;
};

pagination?: Controlled<PaginationState> & { pageSizeOptions?: number[]; isManual?: boolean };
sorting?:    Controlled<Sort[]> & { isMultiSort?: boolean; isManual?: boolean };
selection?:  Controlled<RowId[]>;
expansion?:  Controlled<RowId[]>;   // new, see section 4
```

Usage then reads the same for every feature:

```tsx
<Table
    pagination={{ value: pagination, changeFn: setPagination, isManual: true }}
    sorting={{ value: sorts, changeFn: setSorts, isManual: true }}
    selection={{ value: selectedIds, changeFn: setSelectedIds }}
/>
```

- [x] **Introduce the shared shape** for pagination, sorting and selection.
- [ ] **Fix how [`useControllableState`](../src/components/Table/hooks/useControllableState.tsx) decides "controlled".** Base it on `value !== undefined`, not on whether a change callback is passed, which is how React inputs work. Today, passing a callback without a value counts as controlled with an undefined value.
- [ ] **Rename types:**
  - `BasePagination` → `PaginationState`
  - `SelectedId` → `RowId` (it's the row's id, used for keys too)
  - `PaginationProps` / `SortingProps` / `SelectionProps` → `PaginationOptions` / `SortingOptions` / `SelectionOptions`. They're options on Table, not a component's props. This also frees the name `PaginationProps` for the `Pagination` component.
- [x] **Pass the option objects straight through.** [`useTable`](../src/components/Table/hooks/useTable.tsx) can take `{ pagination, sorting, selection }` as they are. That removes the field-by-field re-mapping in Table.tsx (`onChangeHandler`, `manualPagination`, …) and the `pagination?.pagination as BasePagination` cast.
- [ ] **Consumer tidy-up:** `useState<Sort[] | []>` → `useState<Sort[]>`. `[]` is already a valid `Sort[]`.

## 4. Architecture

- [x] **Keep internal types out of the public types file.** [table.types.ts](../src/types/table.types.ts) mixes the public API (`TableProps`, `ColumnDef`, `Sort`, …) with internal types (`TableRowProps`, `TableHeaderCellProps`, `TableSkeletonProps`, `Use*Options`, `Pins`, `PinInfo`). Move each internal type next to the component or hook that uses it. Keep only the public types, in `src/components/Table/types.ts`.
- [x] **Add `src/components/Table/index.ts`.** Export `Table` and the public types from it, so features import from `@/components/Table` instead of `@/components/Table/Table`. Use named exports throughout; today `Table` is a default export while the others are named.
- [x] **Make the component self-contained.** [usePagination.tsx](../src/components/Table/hooks/usePagination.tsx) imports `DEFAULT_PAGINATION` from `@/lib/constant`, which belongs to the app. Move it into the Table folder. A reusable component shouldn't depend on the app around it.
- [x] **Make expansion controllable like the other features.** The open/closed state lives inside each `TableRow`, so a parent can't open a row on load or collapse them all. The state is also lost when a row remounts (e.g. after paging). An `expansion` option with the shape from section 3 fixes both.
- [x] **Work out the column count in one place.** Table and TableRow each compute it. Compute it in Table and pass it (or the leading columns) down, so the two can't disagree.
- [x] **Smaller items:**
  - Rename the hook files from `.tsx` to `.ts`; they contain no JSX.
  - Default `skeletonRows` to the page size.
  - [Pagination.tsx](../src/components/Table/Pagination.tsx) checks `onSizeChange &&` even though the type makes it required. Make it optional in the type, or drop the check.
  - `ColumnDef` requires `dataKey`, so a computed column (e.g. row actions) isn't possible. Consider making `dataKey` optional and `cell` required when it's missing.

## How to check each step

- Run `npm run typecheck` and `npm run lint`. The two `K` errors go away once `K` is removed.
- Click through `/client-side`, `/server-side` and `/ecommerce-store`. Check paging, sorting, selection, expand/collapse and the nested tables, with the header's Network panel set to errors and to empty results.
