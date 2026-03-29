"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Role } from '../app/generated/prisma/enums';

export async function auth() {
  const cookiesStore = await cookies();
  const tokenObj = await cookiesStore.get("authToken"); // Make sure this matches your cookie name (you used "token" in the previous step)
  const authToken = tokenObj?.value
  if (!authToken) {
    throw new Error("Error reading token");
  }
  const data = jwt.verify(authToken as string, process.env.JWT_SECRET!);
  return data as { id: string; role: Role };
}
