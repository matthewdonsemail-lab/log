import { createContext, useContext, type ReactNode } from 'react'

/**
 * How many 400px columns the registered panel occupies: 1 is the standard
 * form width, 2 is the wide modal width (e.g. a panel embedding a browser
 * view alongside its summary).
 */
export type FormSlotWidth = 1 | 2

export interface FormSlotOptions {
  slots?: FormSlotWidth
}

/**
 * Form slot context. DashboardLayout renders the registered node in a
 * floating overlay above the layout (right side, form width); pages
 * register their form component when open and null it out when closed.
 * The dashboard underneath never reflows — the form sits a z-level higher.
 * Pass `{ slots: 2 }` when the panel needs two columns of width; every
 * existing single-argument call keeps the standard one-slot width.
 */
const DashboardFormContext = createContext<(node: ReactNode | null, options?: FormSlotOptions) => void>(() => {})

export function useDashboardFormSlot() {
  return useContext(DashboardFormContext)
}

export const DashboardFormProvider = DashboardFormContext.Provider