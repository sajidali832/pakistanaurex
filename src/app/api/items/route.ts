import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { items, companies } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single item fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const item = await db
        .select()
        .from(items)
        .where(eq(items.id, parseInt(id)))
        .limit(1);

      if (item.length === 0) {
        return NextResponse.json(
          { error: 'Item not found', code: 'ITEM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(item[0], { status: 200 });
    }

    // List with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const isService = searchParams.get('isService');
    const sort = searchParams.get('sort') ?? 'createdAt';
    const order = searchParams.get('order') ?? 'desc';

    let query = db.select().from(items);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(items.name, `%${search}%`),
          like(items.sku, `%${search}%`)
        )
      );
    }

    if (companyId) {
      const companyIdInt = parseInt(companyId);
      if (!isNaN(companyIdInt)) {
        conditions.push(eq(items.companyId, companyIdInt));
      }
    }

    if (isService !== null && isService !== undefined) {
      const isServiceBool = isService === 'true';
      conditions.push(eq(items.isService, isServiceBool));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = items[sort as keyof typeof items] || items.createdAt;
    query = order === 'asc' 
      ? query.orderBy(sortColumn)
      : query.orderBy(desc(sortColumn));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

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

    // Extract and validate required fields
    const { companyId, name, unitPrice } = body;

    // Validate companyId
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required', code: 'MISSING_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(companyId))) {
      return NextResponse.json(
        { error: 'Company ID must be a valid integer', code: 'INVALID_COMPANY_ID' },
        { status: 400 }
      );
    }

    // Verify company exists
    const companyExists = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(companyId)))
      .limit(1);

    if (companyExists.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate unitPrice
    if (unitPrice === undefined || unitPrice === null) {
      return NextResponse.json(
        { error: 'Unit price is required', code: 'MISSING_UNIT_PRICE' },
        { status: 400 }
      );
    }

    const unitPriceNum = parseFloat(unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum < 0) {
      return NextResponse.json(
        { error: 'Unit price must be a valid positive number', code: 'INVALID_UNIT_PRICE' },
        { status: 400 }
      );
    }

    // Extract optional fields
    const {
      nameUrdu,
      description,
      unit,
      taxRate,
      isService,
      sku
    } = body;

    // Validate taxRate if provided
    let taxRateValue = 0;
    if (taxRate !== undefined && taxRate !== null) {
      taxRateValue = parseFloat(taxRate);
      if (isNaN(taxRateValue) || taxRateValue < 0 || taxRateValue > 100) {
        return NextResponse.json(
          { error: 'Tax rate must be a valid number between 0 and 100', code: 'INVALID_TAX_RATE' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data with defaults and sanitization
    const insertData = {
      companyId: parseInt(companyId),
      name: name.trim(),
      nameUrdu: nameUrdu ? nameUrdu.trim() : null,
      description: description ? description.trim() : null,
      unitPrice: unitPriceNum,
      unit: unit ? unit.trim() : 'piece',
      taxRate: taxRateValue,
      isService: isService === true || isService === 'true' ? true : false,
      sku: sku ? sku.trim() : null,
      createdAt: new Date().toISOString()
    };

    // Insert into database
    const newItem = await db.insert(items).values(insertData).returning();

    return NextResponse.json(newItem[0], { status: 201 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const itemId = parseInt(id);

    // Check if item exists
    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Item not found', code: 'ITEM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Prepare update object
    const updates: Record<string, any> = {};

    // Validate and add companyId if provided
    if (body.companyId !== undefined) {
      const companyIdInt = parseInt(body.companyId);
      if (isNaN(companyIdInt)) {
        return NextResponse.json(
          { error: 'Company ID must be a valid integer', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }

      // Verify company exists
      const companyExists = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyIdInt))
        .limit(1);

      if (companyExists.length === 0) {
        return NextResponse.json(
          { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
          { status: 400 }
        );
      }

      updates.companyId = companyIdInt;
    }

    // Validate and add name if provided
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    // Add optional text fields
    if (body.nameUrdu !== undefined) {
      updates.nameUrdu = body.nameUrdu ? body.nameUrdu.trim() : null;
    }

    if (body.description !== undefined) {
      updates.description = body.description ? body.description.trim() : null;
    }

    if (body.unit !== undefined) {
      updates.unit = body.unit ? body.unit.trim() : 'piece';
    }

    if (body.sku !== undefined) {
      updates.sku = body.sku ? body.sku.trim() : null;
    }

    // Validate and add unitPrice if provided
    if (body.unitPrice !== undefined) {
      const unitPriceNum = parseFloat(body.unitPrice);
      if (isNaN(unitPriceNum) || unitPriceNum < 0) {
        return NextResponse.json(
          { error: 'Unit price must be a valid positive number', code: 'INVALID_UNIT_PRICE' },
          { status: 400 }
        );
      }
      updates.unitPrice = unitPriceNum;
    }

    // Validate and add taxRate if provided
    if (body.taxRate !== undefined) {
      const taxRateNum = parseFloat(body.taxRate);
      if (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 100) {
        return NextResponse.json(
          { error: 'Tax rate must be a valid number between 0 and 100', code: 'INVALID_TAX_RATE' },
          { status: 400 }
        );
      }
      updates.taxRate = taxRateNum;
    }

    // Add isService if provided
    if (body.isService !== undefined) {
      updates.isService = body.isService === true || body.isService === 'true' ? true : false;
    }

    // If no fields to update, return error
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_FIELDS_TO_UPDATE' },
        { status: 400 }
      );
    }

    // Update the item
    const updatedItem = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json(updatedItem[0], { status: 200 });
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

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const itemId = parseInt(id);

    // Check if item exists
    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json(
        { error: 'Item not found', code: 'ITEM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the item
    const deleted = await db
      .delete(items)
      .where(eq(items.id, itemId))
      .returning();

    return NextResponse.json(
      {
        message: 'Item deleted successfully',
        id: itemId,
        deleted: deleted[0]
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