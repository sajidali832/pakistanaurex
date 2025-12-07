import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { invoiceLines } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single invoice line by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const invoiceLine = await db
        .select()
        .from(invoiceLines)
        .where(eq(invoiceLines.id, parseInt(id)))
        .limit(1);

      if (invoiceLine.length === 0) {
        return NextResponse.json(
          { error: 'Invoice line not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(invoiceLine[0], { status: 200 });
    }

    // List invoice lines with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const invoiceId = searchParams.get('invoiceId');

    let query = db.select().from(invoiceLines);

    // Filter by invoiceId if provided
    if (invoiceId) {
      if (isNaN(parseInt(invoiceId))) {
        return NextResponse.json(
          { error: 'Valid invoiceId is required', code: 'INVALID_INVOICE_ID' },
          { status: 400 }
        );
      }
      query = query.where(eq(invoiceLines.invoiceId, parseInt(invoiceId)));
    }

    const results = await query
      .orderBy(asc(invoiceLines.sortOrder))
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
    const {
      invoiceId,
      itemId,
      description,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      lineTotal,
      sortOrder,
    } = body;

    // Validate required fields
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required', code: 'MISSING_INVOICE_ID' },
        { status: 400 }
      );
    }

    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    if (unitPrice === undefined || unitPrice === null) {
      return NextResponse.json(
        { error: 'unitPrice is required', code: 'MISSING_UNIT_PRICE' },
        { status: 400 }
      );
    }

    if (lineTotal === undefined || lineTotal === null) {
      return NextResponse.json(
        { error: 'lineTotal is required', code: 'MISSING_LINE_TOTAL' },
        { status: 400 }
      );
    }

    // Validate invoiceId is a valid integer
    if (isNaN(parseInt(invoiceId))) {
      return NextResponse.json(
        { error: 'invoiceId must be a valid integer', code: 'INVALID_INVOICE_ID' },
        { status: 400 }
      );
    }

    // Validate quantity is a positive number
    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: 'quantity must be a positive number', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    // Validate unitPrice is a positive number
    const unitPriceNum = parseFloat(unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
      return NextResponse.json(
        { error: 'unitPrice must be a positive number', code: 'INVALID_UNIT_PRICE' },
        { status: 400 }
      );
    }

    // Validate lineTotal is a valid number
    const lineTotalNum = parseFloat(lineTotal);
    if (isNaN(lineTotalNum)) {
      return NextResponse.json(
        { error: 'lineTotal must be a valid number', code: 'INVALID_LINE_TOTAL' },
        { status: 400 }
      );
    }

    // Validate itemId if provided
    if (itemId !== undefined && itemId !== null && isNaN(parseInt(itemId))) {
      return NextResponse.json(
        { error: 'itemId must be a valid integer', code: 'INVALID_ITEM_ID' },
        { status: 400 }
      );
    }

    // Validate taxRate if provided
    let taxRateNum = 0;
    if (taxRate !== undefined && taxRate !== null) {
      taxRateNum = parseFloat(taxRate);
      if (isNaN(taxRateNum)) {
        return NextResponse.json(
          { error: 'taxRate must be a valid number', code: 'INVALID_TAX_RATE' },
          { status: 400 }
        );
      }
    }

    // Validate taxAmount if provided
    let taxAmountNum = 0;
    if (taxAmount !== undefined && taxAmount !== null) {
      taxAmountNum = parseFloat(taxAmount);
      if (isNaN(taxAmountNum)) {
        return NextResponse.json(
          { error: 'taxAmount must be a valid number', code: 'INVALID_TAX_AMOUNT' },
          { status: 400 }
        );
      }
    }

    // Validate sortOrder if provided
    let sortOrderNum = 0;
    if (sortOrder !== undefined && sortOrder !== null) {
      sortOrderNum = parseInt(sortOrder);
      if (isNaN(sortOrderNum)) {
        return NextResponse.json(
          { error: 'sortOrder must be a valid integer', code: 'INVALID_SORT_ORDER' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      invoiceId: parseInt(invoiceId),
      description: description.trim(),
      quantity: quantityNum,
      unitPrice: unitPriceNum,
      lineTotal: lineTotalNum,
      taxRate: taxRateNum,
      taxAmount: taxAmountNum,
      sortOrder: sortOrderNum,
    };

    // Add optional itemId if provided
    if (itemId !== undefined && itemId !== null) {
      insertData.itemId = parseInt(itemId);
    }

    const newInvoiceLine = await db
      .insert(invoiceLines)
      .values(insertData)
      .returning();

    return NextResponse.json(newInvoiceLine[0], { status: 201 });
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      invoiceId,
      itemId,
      description,
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      lineTotal,
      sortOrder,
    } = body;

    // Check if invoice line exists
    const existing = await db
      .select()
      .from(invoiceLines)
      .where(eq(invoiceLines.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Invoice line not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    // Validate and add invoiceId if provided
    if (invoiceId !== undefined) {
      if (isNaN(parseInt(invoiceId))) {
        return NextResponse.json(
          { error: 'invoiceId must be a valid integer', code: 'INVALID_INVOICE_ID' },
          { status: 400 }
        );
      }
      updateData.invoiceId = parseInt(invoiceId);
    }

    // Validate and add itemId if provided
    if (itemId !== undefined) {
      if (itemId !== null && isNaN(parseInt(itemId))) {
        return NextResponse.json(
          { error: 'itemId must be a valid integer', code: 'INVALID_ITEM_ID' },
          { status: 400 }
        );
      }
      updateData.itemId = itemId !== null ? parseInt(itemId) : null;
    }

    // Validate and add description if provided
    if (description !== undefined) {
      if (!description || description.trim() === '') {
        return NextResponse.json(
          { error: 'description cannot be empty', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
      updateData.description = description.trim();
    }

    // Validate and add quantity if provided
    if (quantity !== undefined) {
      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return NextResponse.json(
          { error: 'quantity must be a positive number', code: 'INVALID_QUANTITY' },
          { status: 400 }
        );
      }
      updateData.quantity = quantityNum;
    }

    // Validate and add unitPrice if provided
    if (unitPrice !== undefined) {
      const unitPriceNum = parseFloat(unitPrice);
      if (isNaN(unitPriceNum) || unitPriceNum <= 0) {
        return NextResponse.json(
          { error: 'unitPrice must be a positive number', code: 'INVALID_UNIT_PRICE' },
          { status: 400 }
        );
      }
      updateData.unitPrice = unitPriceNum;
    }

    // Validate and add taxRate if provided
    if (taxRate !== undefined) {
      const taxRateNum = parseFloat(taxRate);
      if (isNaN(taxRateNum)) {
        return NextResponse.json(
          { error: 'taxRate must be a valid number', code: 'INVALID_TAX_RATE' },
          { status: 400 }
        );
      }
      updateData.taxRate = taxRateNum;
    }

    // Validate and add taxAmount if provided
    if (taxAmount !== undefined) {
      const taxAmountNum = parseFloat(taxAmount);
      if (isNaN(taxAmountNum)) {
        return NextResponse.json(
          { error: 'taxAmount must be a valid number', code: 'INVALID_TAX_AMOUNT' },
          { status: 400 }
        );
      }
      updateData.taxAmount = taxAmountNum;
    }

    // Validate and add lineTotal if provided
    if (lineTotal !== undefined) {
      const lineTotalNum = parseFloat(lineTotal);
      if (isNaN(lineTotalNum)) {
        return NextResponse.json(
          { error: 'lineTotal must be a valid number', code: 'INVALID_LINE_TOTAL' },
          { status: 400 }
        );
      }
      updateData.lineTotal = lineTotalNum;
    }

    // Validate and add sortOrder if provided
    if (sortOrder !== undefined) {
      const sortOrderNum = parseInt(sortOrder);
      if (isNaN(sortOrderNum)) {
        return NextResponse.json(
          { error: 'sortOrder must be a valid integer', code: 'INVALID_SORT_ORDER' },
          { status: 400 }
        );
      }
      updateData.sortOrder = sortOrderNum;
    }

    // Perform update
    const updated = await db
      .update(invoiceLines)
      .set(updateData)
      .where(eq(invoiceLines.id, parseInt(id)))
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
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if invoice line exists
    const existing = await db
      .select()
      .from(invoiceLines)
      .where(eq(invoiceLines.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Invoice line not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(invoiceLines)
      .where(eq(invoiceLines.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Invoice line deleted successfully',
        id: deleted[0].id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}