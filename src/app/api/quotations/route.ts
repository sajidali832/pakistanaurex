import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { quotations, user } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

const VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'converted'] as const;

async function getUserCompanyId() {
  const { userId } = await auth();
  if (!userId) return null;

  const currentUser = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return currentUser[0]?.companyId || null;
}

export async function GET(request: NextRequest) {
  try {
    const companyId = await getUserCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const quotation = await db
        .select()
        .from(quotations)
        .where(and(eq(quotations.id, parseInt(id)), eq(quotations.companyId, companyId)))
        .limit(1);

      if (quotation.length === 0) {
        return NextResponse.json(
          { error: 'Quotation not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(quotation[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const conditions = [eq(quotations.companyId, companyId)];

    if (search) {
      conditions.push(like(quotations.quotationNumber, `%${search}%`));
    }

    if (clientId) {
      conditions.push(eq(quotations.clientId, parseInt(clientId)));
    }

    if (status) {
      conditions.push(eq(quotations.status, status));
    }

    const results = await db
      .select()
      .from(quotations)
      .where(and(...conditions))
      .orderBy(desc(quotations.createdAt))
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
    const companyId = await getUserCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.clientId) {
      return NextResponse.json(
        { error: 'Client ID is required', code: 'MISSING_CLIENT_ID' },
        { status: 400 }
      );
    }

    if (!body.quotationNumber || body.quotationNumber.trim() === '') {
      return NextResponse.json(
        { error: 'Quotation number is required', code: 'MISSING_QUOTATION_NUMBER' },
        { status: 400 }
      );
    }

    if (!body.issueDate) {
      return NextResponse.json(
        { error: 'Issue date is required', code: 'MISSING_ISSUE_DATE' },
        { status: 400 }
      );
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const quotationData = {
      companyId: companyId,
      clientId: parseInt(body.clientId),
      quotationNumber: body.quotationNumber.trim(),
      issueDate: body.issueDate,
      validUntil: body.validUntil || null,
      status: body.status || 'draft',
      subtotal: body.subtotal !== undefined ? parseFloat(body.subtotal) : 0,
      taxAmount: body.taxAmount !== undefined ? parseFloat(body.taxAmount) : 0,
      discountAmount: body.discountAmount !== undefined ? parseFloat(body.discountAmount) : 0,
      total: body.total !== undefined ? parseFloat(body.total) : 0,
      currency: body.currency?.trim() || 'PKR',
      notes: body.notes ? body.notes.trim() : null,
      terms: body.terms ? body.terms.trim() : null,
      convertedInvoiceId: body.convertedInvoiceId ? parseInt(body.convertedInvoiceId) : null,
      createdBy: body.createdBy ? parseInt(body.createdBy) : null,
      createdAt: new Date().toISOString(),
    };

    const newQuotation = await db.insert(quotations).values(quotationData).returning();

    return NextResponse.json(newQuotation[0], { status: 201 });
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
    const companyId = await getUserCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(quotations)
      .where(and(eq(quotations.id, parseInt(id)), eq(quotations.companyId, companyId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(', ')}`, code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.clientId !== undefined) updateData.clientId = parseInt(body.clientId);
    if (body.quotationNumber !== undefined) updateData.quotationNumber = body.quotationNumber.trim();
    if (body.issueDate !== undefined) updateData.issueDate = body.issueDate;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.subtotal !== undefined) updateData.subtotal = parseFloat(body.subtotal);
    if (body.taxAmount !== undefined) updateData.taxAmount = parseFloat(body.taxAmount);
    if (body.discountAmount !== undefined) updateData.discountAmount = parseFloat(body.discountAmount);
    if (body.total !== undefined) updateData.total = parseFloat(body.total);
    if (body.currency !== undefined) updateData.currency = body.currency.trim();
    if (body.notes !== undefined) updateData.notes = body.notes ? body.notes.trim() : null;
    if (body.terms !== undefined) updateData.terms = body.terms ? body.terms.trim() : null;
    if (body.convertedInvoiceId !== undefined) updateData.convertedInvoiceId = body.convertedInvoiceId ? parseInt(body.convertedInvoiceId) : null;

    const updated = await db
      .update(quotations)
      .set(updateData)
      .where(and(eq(quotations.id, parseInt(id)), eq(quotations.companyId, companyId)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
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
    const companyId = await getUserCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(quotations)
      .where(and(eq(quotations.id, parseInt(id)), eq(quotations.companyId, companyId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(quotations)
      .where(and(eq(quotations.id, parseInt(id)), eq(quotations.companyId, companyId)))
      .returning();

    return NextResponse.json({ message: 'Quotation deleted successfully', quotation: deleted[0] }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}