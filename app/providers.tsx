'use client'

import SessionProvider from "./providers/SessionProvider"

type Props = {
  children?: React.ReactNode
}

export const Providers = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>
}