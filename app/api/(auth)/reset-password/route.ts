import { NextRequest } from 'next/server';
import { auth } from '../../../../actions/authAction';



export const POST = async (req: NextRequest) => {
  const user = await auth()
  
}