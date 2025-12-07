import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single payment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const payment = await db.select()
        .from(payments)
        .where(eq(payments.id, parseInt(id)))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json({ 
          error: 'Payment not found',
          code: "PAYMENT_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(payment[0], { status: 200 });
    }

    // List payments with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const companyId = searchParams.get('companyId');
    const invoiceId = searchParams.get('invoiceId');
    const paymentMethod = searchParams.get('paymentMethod');

    let query = db.select().from(payments);

    // Build filter conditions
    const conditions = [];
    if (companyId) {
      const parsedCompanyId = parseInt(companyId);
      if (!isNaN(parsedCompanyId)) {
        conditions.push(eq(payments.companyId, parsedCompanyId));
      }
    }
    if (invoiceId) {
      const parsedInvoiceId = parseInt(invoiceId);
      if (!isNaN(parsedInvoiceId)) {
        conditions.push(eq(payments.invoiceId, parsedInvoiceId));
      }
    }
    if (paymentMethod) {
      conditions.push(eq(payments.paymentMethod, paymentMethod.trim()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, invoiceId, amount, paymentDate, paymentMethod, referenceNumber, notes } = body;

    // Validate required fields
    if (!companyId) {
      return NextResponse.json({ 
        error: "Company ID is required",
        code: "MISSING_COMPANY_ID" 
      }, { status: 400 });
    }

    if (!invoiceId) {
      return NextResponse.json({ 
        error: "Invoice ID is required",
        code: "MISSING_INVOICE_ID" 
      }, { status: 400 });
    }

    if (!amount && amount !== 0) {
      return NextResponse.json({ 
        error: "Amount is required",
        code: "MISSING_AMOUNT" 
      }, { status: 400 });
    }

    if (!paymentDate) {
      return NextResponse.json({ 
        error: "Payment date is required",
        code: "MISSING_PAYMENT_DATE" 
      }, { status: 400 });
    }

    // Validate amount is a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number",
        code: "INVALID_AMOUNT" 
      }, { status: 400 });
    }

    // Validate IDs are valid integers
    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return NextResponse.json({ 
        error: "Valid company ID is required",
        code: "INVALID_COMPANY_ID" 
      }, { status: 400 });
    }

    const parsedInvoiceId = parseInt(invoiceId);
    if (isNaN(parsedInvoiceId)) {
      return NextResponse.json({ 
        error: "Valid invoice ID is required",
        code: "INVALID_INVOICE_ID" 
      }, { status: 400 });
    }

    // Validate paymentDate is a valid date
    const parsedDate = new Date(paymentDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ 
        error: "Valid payment date is required",
        code: "INVALID_PAYMENT_DATE" 
      }, { status: 400 });
    }

    // Prepare payment data
    const paymentData: any = {
      companyId: parsedCompanyId,
      invoiceId: parsedInvoiceId,
      amount: parsedAmount,
      paymentDate: paymentDate.trim(),
      createdAt: new Date().toISOString()
    };

    // Add optional fields if provided
    if (paymentMethod) {
      paymentData.paymentMethod = paymentMethod.trim();
    }
    if (referenceNumber) {
      paymentData.referenceNumber = referenceNumber.trim();
    }
    if (notes) {
      paymentData.notes = notes.trim();
    }

    const newPayment = await db.insert(payments)
      .values(paymentData)
      .returning();

    return NextResponse.json(newPayment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const parsedId = parseInt(id);

    // Check if payment exists
    const existingPayment = await db.select()
      .from(payments)
      .where(eq(payments.id, parsedId))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json({ 
        error: 'Payment not found',
        code: "PAYMENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const body = await request.json();
    const { companyId, invoiceId, amount, paymentDate, paymentMethod, referenceNumber, notes } = body;

    // Prepare update data
    const updateData: any = {};

    // Validate and add fields if provided
    if (companyId !== undefined) {
      const parsedCompanyId = parseInt(companyId);
      if (isNaN(parsedCompanyId)) {
        return NextResponse.json({ 
          error: "Valid company ID is required",
          code: "INVALID_COMPANY_ID" 
        }, { status: 400 });
      }
      updateData.companyId = parsedCompanyId;
    }

    if (invoiceId !== undefined) {
      const parsedInvoiceId = parseInt(invoiceId);
      if (isNaN(parsedInvoiceId)) {
        return NextResponse.json({ 
          error: "Valid invoice ID is required",
          code: "INVALID_INVOICE_ID" 
        }, { status: 400 });
      }
      updateData.invoiceId = parsedInvoiceId;
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json({ 
          error: "Amount must be a positive number",
          code: "INVALID_AMOUNT" 
        }, { status: 400 });
      }
      updateData.amount = parsedAmount;
    }

    if (paymentDate !== undefined) {
      const parsedDate = new Date(paymentDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ 
          error: "Valid payment date is required",
          code: "INVALID_PAYMENT_DATE" 
        }, { status: 400 });
      }
      updateData.paymentDate = paymentDate.trim();
    }

    if (paymentMethod !== undefined) {
      updateData.paymentMethod = paymentMethod ? paymentMethod.trim() : null;
    }

    if (referenceNumber !== undefined) {
      updateData.referenceNumber = referenceNumber ? referenceNumber.trim() : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : null;
    }

    // Only update if there are fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existingPayment[0], { status: 200 });
    }

    const updated = await db.update(payments)
      .set(updateData)
      .where(eq(payments.id, parsedId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const parsedId = parseInt(id);

    // Check if payment exists
    const existingPayment = await db.select()
      .from(payments)
      .where(eq(payments.id, parsedId))
      .limit(1);

    if (existingPayment.length === 0) {
      return NextResponse.json({ 
        error: 'Payment not found',
        code: "PAYMENT_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(payments)
      .where(eq(payments.id, parsedId))
      .returning();

    return NextResponse.json({ 
      message: "Payment deleted successfully",
      id: parsedId,
      payment: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}