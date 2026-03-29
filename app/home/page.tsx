"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function Home(){
    return <div>
        <Button className=' p-2 mr-4'  onClick={() => signOut({ callbackUrl: '/signin' })}>Sign Out</Button>
    </div>
}