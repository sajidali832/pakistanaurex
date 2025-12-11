import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

const VALID_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, parseInt(id)))
        .limit(1);

      if (invoice.length === 0) {
        return NextResponse.json(
          { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(invoice[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const conditions = [];

    if (search) {
      conditions.push(like(invoices.invoiceNumber, `%${search}%`));
    }

    if (clientId) {
      const clientIdInt = parseInt(clientId);
      if (!isNaN(clientIdInt)) {
        conditions.push(eq(invoices.clientId, clientIdInt));
      }
    }

    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    let query = db.select().from(invoices);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.companyId) {
      return NextResponse.json(
        { error: 'Company ID is required', code: 'MISSING_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (!body.clientId) {
      return NextResponse.json(
        { error: 'Client ID is required', code: 'MISSING_CLIENT_ID' },
        { status: 400 }
      );
    }

    if (!body.invoiceNumber || body.invoiceNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Invoice number is required', code: 'MISSING_INVOICE_NUMBER' },
        { status: 400 }
      );
    }

    if (!body.issueDate) {
      return NextResponse.json(
        { error: 'Issue date is required', code: 'MISSING_ISSUE_DATE' },
        { status: 400 }
      );
    }

    const issueDateObj = new Date(body.issueDate);
    if (isNaN(issueDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Issue date must be a valid date', code: 'INVALID_ISSUE_DATE' },
        { status: 400 }
      );
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const invoiceData = {
      companyId: parseInt(body.companyId),
      clientId: parseInt(body.clientId),
      invoiceNumber: body.invoiceNumber.trim(),
      issueDate: body.issueDate,
      dueDate: body.dueDate || null,
      status: body.status || 'draft',
      subtotal: body.subtotal !== undefined ? parseFloat(body.subtotal) : 0,
      taxAmount: body.taxAmount !== undefined ? parseFloat(body.taxAmount) : 0,
      discountAmount: body.discountAmount !== undefined ? parseFloat(body.discountAmount) : 0,
      total: body.total !== undefined ? parseFloat(body.total) : 0,
      amountPaid: body.amountPaid !== undefined ? parseFloat(body.amountPaid) : 0,
      currency: body.currency || 'PKR',
      notes: body.notes || null,
      terms: body.terms || null,
      createdBy: body.createdBy !== undefined && body.createdBy !== null ? parseInt(body.createdBy) : null,
      createdAt: now,
      updatedAt: now,
    };

    const newInvoice = await db.insert(invoices).values(invoiceData).returning();

    return NextResponse.json(newInvoice[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, parseInt(id)))
      .limit(1);

    if (existingInvoice.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const updates: any = { updatedAt: new Date().toISOString() };

    if (body.companyId !== undefined) updates.companyId = parseInt(body.companyId);
    if (body.clientId !== undefined) updates.clientId = parseInt(body.clientId);
    if (body.invoiceNumber !== undefined) updates.invoiceNumber = body.invoiceNumber.trim();
    if (body.issueDate !== undefined) updates.issueDate = body.issueDate;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.status !== undefined) updates.status = body.status;
    if (body.subtotal !== undefined) updates.subtotal = parseFloat(body.subtotal);
    if (body.taxAmount !== undefined) updates.taxAmount = parseFloat(body.taxAmount);
    if (body.discountAmount !== undefined) updates.discountAmount = parseFloat(body.discountAmount);
    if (body.total !== undefined) updates.total = parseFloat(body.total);
    if (body.amountPaid !== undefined) updates.amountPaid = parseFloat(body.amountPaid);
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.terms !== undefined) updates.terms = body.terms;

    const updatedInvoice = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedInvoice[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, parseInt(id)))
      .limit(1);

    if (existingInvoice.length === 0) {
      return NextResponse.json(
        { error: 'Invoice not found', code: 'INVOICE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(invoices)
      .where(eq(invoices.id, parseInt(id)))
      .returning();

    return NextResponse.json({ message: 'Invoice deleted successfully', invoice: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}