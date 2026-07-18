"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type StoreType = "appliances" | "furniture"

interface StoreContextType {
  activeStore: StoreType
  setActiveStore: (store: StoreType) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activeStore, setActiveStoreState] = useState<StoreType>("appliances")

  useEffect(() => {
    // Check local storage on mount to persist store choice
    const savedStore = localStorage.getItem("srisai_store") as StoreType
    if (savedStore && (savedStore === "appliances" || savedStore === "furniture")) {
      setActiveStoreState(savedStore)
    }
  }, [])

  const setActiveStore = (store: StoreType) => {
    setActiveStoreState(store)
    localStorage.setItem("srisai_store", store)
  }

  return (
    <StoreContext.Provider value={{ activeStore, setActiveStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
