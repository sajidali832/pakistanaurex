import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quotationLines } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single quotation line by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const line = await db
        .select()
        .from(quotationLines)
        .where(eq(quotationLines.id, parseInt(id)))
        .limit(1);

      if (line.length === 0) {
        return NextResponse.json(
          { error: 'Quotation line not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(line[0], { status: 200 });
    }

    // List quotation lines with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const quotationId = searchParams.get('quotationId');

    let query = db.select().from(quotationLines);

    // Filter by quotationId if provided
    if (quotationId) {
      if (isNaN(parseInt(quotationId))) {
        return NextResponse.json(
          { error: 'Valid quotation ID is required', code: 'INVALID_QUOTATION_ID' },
          { status: 400 }
        );
      }
      query = query.where(eq(quotationLines.quotationId, parseInt(quotationId)));
    }

    const results = await query
      .orderBy(asc(quotationLines.sortOrder))
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

    // Validate required fields
    if (!body.quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required', code: 'MISSING_QUOTATION_ID' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (body.quantity === undefined || body.quantity === null) {
      return NextResponse.json(
        { error: 'Quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    if (body.unitPrice === undefined || body.unitPrice === null) {
      return NextResponse.json(
        { error: 'Unit price is required', code: 'MISSING_UNIT_PRICE' },
        { status: 400 }
      );
    }

    if (body.lineTotal === undefined || body.lineTotal === null) {
      return NextResponse.json(
        { error: 'Line total is required', code: 'MISSING_LINE_TOTAL' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const quantity = parseFloat(body.quantity);
    const unitPrice = parseFloat(body.unitPrice);
    const lineTotal = parseFloat(body.lineTotal);

    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number', code: 'INVALID_QUANTITY' },
        { status: 400 }
      );
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      return NextResponse.json(
        { error: 'Unit price must be a positive number', code: 'INVALID_UNIT_PRICE' },
        { status: 400 }
      );
    }

    if (isNaN(lineTotal)) {
      return NextResponse.json(
        { error: 'Line total must be a valid number', code: 'INVALID_LINE_TOTAL' },
        { status: 400 }
      );
    }

    // Validate quotationId is integer
    const quotationId = parseInt(body.quotationId);
    if (isNaN(quotationId)) {
      return NextResponse.json(
        { error: 'Quotation ID must be a valid integer', code: 'INVALID_QUOTATION_ID' },
        { status: 400 }
      );
    }

    // Validate itemId if provided
    let itemId = null;
    if (body.itemId !== undefined && body.itemId !== null) {
      itemId = parseInt(body.itemId);
      if (isNaN(itemId)) {
        return NextResponse.json(
          { error: 'Item ID must be a valid integer', code: 'INVALID_ITEM_ID' },
          { status: 400 }
        );
      }
    }

    // Parse optional numeric fields with defaults
    const taxRate = body.taxRate !== undefined && body.taxRate !== null ? parseFloat(body.taxRate) : 0;
    const taxAmount = body.taxAmount !== undefined && body.taxAmount !== null ? parseFloat(body.taxAmount) : 0;
    const sortOrder = body.sortOrder !== undefined && body.sortOrder !== null ? parseInt(body.sortOrder) : 0;

    if (isNaN(taxRate)) {
      return NextResponse.json(
        { error: 'Tax rate must be a valid number', code: 'INVALID_TAX_RATE' },
        { status: 400 }
      );
    }

    if (isNaN(taxAmount)) {
      return NextResponse.json(
        { error: 'Tax amount must be a valid number', code: 'INVALID_TAX_AMOUNT' },
        { status: 400 }
      );
    }

    if (isNaN(sortOrder)) {
      return NextResponse.json(
        { error: 'Sort order must be a valid integer', code: 'INVALID_SORT_ORDER' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      quotationId,
      itemId,
      description: body.description.trim(),
      quantity,
      unitPrice,
      taxRate,
      taxAmount,
      lineTotal,
      sortOrder,
    };

    const newLine = await db.insert(quotationLines).values(insertData).returning();

    return NextResponse.json(newLine[0], { status: 201 });
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

    const lineId = parseInt(id);

    // Check if quotation line exists
    const existingLine = await db
      .select()
      .from(quotationLines)
      .where(eq(quotationLines.id, lineId))
      .limit(1);

    if (existingLine.length === 0) {
      return NextResponse.json(
        { error: 'Quotation line not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and prepare updates
    if (body.quotationId !== undefined) {
      const quotationId = parseInt(body.quotationId);
      if (isNaN(quotationId)) {
        return NextResponse.json(
          { error: 'Quotation ID must be a valid integer', code: 'INVALID_QUOTATION_ID' },
          { status: 400 }
        );
      }
      updates.quotationId = quotationId;
    }

    if (body.itemId !== undefined) {
      if (body.itemId === null) {
        updates.itemId = null;
      } else {
        const itemId = parseInt(body.itemId);
        if (isNaN(itemId)) {
          return NextResponse.json(
            { error: 'Item ID must be a valid integer', code: 'INVALID_ITEM_ID' },
            { status: 400 }
          );
        }
        updates.itemId = itemId;
      }
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim() === '') {
        return NextResponse.json(
          { error: 'Description must be a non-empty string', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
      updates.description = body.description.trim();
    }

    if (body.quantity !== undefined) {
      const quantity = parseFloat(body.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantity must be a positive number', code: 'INVALID_QUANTITY' },
          { status: 400 }
        );
      }
      updates.quantity = quantity;
    }

    if (body.unitPrice !== undefined) {
      const unitPrice = parseFloat(body.unitPrice);
      if (isNaN(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          { error: 'Unit price must be a positive number', code: 'INVALID_UNIT_PRICE' },
          { status: 400 }
        );
      }
      updates.unitPrice = unitPrice;
    }

    if (body.taxRate !== undefined) {
      const taxRate = parseFloat(body.taxRate);
      if (isNaN(taxRate)) {
        return NextResponse.json(
          { error: 'Tax rate must be a valid number', code: 'INVALID_TAX_RATE' },
          { status: 400 }
        );
      }
      updates.taxRate = taxRate;
    }

    if (body.taxAmount !== undefined) {
      const taxAmount = parseFloat(body.taxAmount);
      if (isNaN(taxAmount)) {
        return NextResponse.json(
          { error: 'Tax amount must be a valid number', code: 'INVALID_TAX_AMOUNT' },
          { status: 400 }
        );
      }
      updates.taxAmount = taxAmount;
    }

    if (body.lineTotal !== undefined) {
      const lineTotal = parseFloat(body.lineTotal);
      if (isNaN(lineTotal)) {
        return NextResponse.json(
          { error: 'Line total must be a valid number', code: 'INVALID_LINE_TOTAL' },
          { status: 400 }
        );
      }
      updates.lineTotal = lineTotal;
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = parseInt(body.sortOrder);
      if (isNaN(sortOrder)) {
        return NextResponse.json(
          { error: 'Sort order must be a valid integer', code: 'INVALID_SORT_ORDER' },
          { status: 400 }
        );
      }
      updates.sortOrder = sortOrder;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updatedLine = await db
      .update(quotationLines)
      .set(updates)
      .where(eq(quotationLines.id, lineId))
      .returning();

    return NextResponse.json(updatedLine[0], { status: 200 });
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

    const lineId = parseInt(id);

    // Check if quotation line exists
    const existingLine = await db
      .select()
      .from(quotationLines)
      .where(eq(quotationLines.id, lineId))
      .limit(1);

    if (existingLine.length === 0) {
      return NextResponse.json(
        { error: 'Quotation line not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(quotationLines)
      .where(eq(quotationLines.id, lineId))
      .returning();

    return NextResponse.json(
      {
        message: 'Quotation line deleted successfully',
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