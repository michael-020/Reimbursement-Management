import { prisma } from "@/lib/prisma";
import Link from "next/link";


export default async function Home() {
  const user = await prisma.user.findMany()
  console.log(user)
  return (
    <div>
      <Link href={"/signin"} className="border p-2">Sign in</Link>
      <Link href={"/verify-email"} className="border p-2">Sign up</Link>
    </div>
  );
}
