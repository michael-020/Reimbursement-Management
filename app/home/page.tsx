"use client"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/useAuthStore"
import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function Home(){
    const { authUser } = useAuthStore() 
      const { getSession } = useAuthStore();

  useEffect(() => {
    getSession();
  }, []);

    return <div>
        <Button className=' p-2 mr-4'  onClick={() => signOut({ callbackUrl: '/signin' })}>Sign Out</Button>
        <div>user: {authUser ? authUser.name : "not found"}</div>
    </div>
}