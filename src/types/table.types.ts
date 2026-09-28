

import type { ReactNode } from 'react'

type BaseColumn = {
  id: string
  header : React.ReactNode
  headerClassName?: string
  /** Exact column width (number = px, or any CSS length like "20%"). Omit to let the column fill leftover space. */
  width?: number | string
  /** For columns without `width`: the narrowest (px) it may get before the table scrolls sideways. */
  minWidth?: number
  /** Let cell content wrap onto multiple lines instead of truncating with "…". */
  wrap?: boolean
  /** Sticks the column to that side when scrolling sideways. Needs `width` to line up. */
  pinned?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

export type ColumnDef<T> = {
  [K in keyof T]-?: BaseColumn & {
    dataKey: K
    cell?: (props: { row: T; value: T[K] }) => ReactNode,
    cellClassName? :string
  }
}[keyof T]



export type TableProps<T> = {
    columns: ColumnDef<T>[],
    data : T[]
    ariaLabel? : string,
}
