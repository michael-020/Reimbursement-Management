import { NextRequest, NextResponse } from 'next/server';
import { getSupportedCurrencies, convertCurrency } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    // If conversion parameters are provided, perform conversion
    if (from && to && amount) {
      try {
        const conversion = await convertCurrency(parseFloat(amount), from, to);
        return NextResponse.json({
          success: true,
          conversion
        });
      } catch (error) {
        console.error('Currency conversion error:', error);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to convert currency',
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Otherwise, return supported currencies
    const currencies = getSupportedCurrencies();
    
    return NextResponse.json({
      success: true,
      currencies,
      message: 'Supported currencies retrieved successfully'
    });

  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
