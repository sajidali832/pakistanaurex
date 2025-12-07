import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bankTransactions } from '@/db/schema';
import { eq, and, isNull, isNotNull, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single bank transaction by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const transaction = await db
        .select()
        .from(bankTransactions)
        .where(eq(bankTransactions.id, parseInt(id)))
        .limit(1);

      if (transaction.length === 0) {
        return NextResponse.json(
          { error: 'Bank transaction not found', code: 'TRANSACTION_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(transaction[0], { status: 200 });
    }

    // List all bank transactions with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type');
    const matched = searchParams.get('matched');

    let query = db.select().from(bankTransactions);

    // Build filter conditions
    const conditions = [];

    if (companyId) {
      if (isNaN(parseInt(companyId))) {
        return NextResponse.json(
          { error: 'Valid company ID is required', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bankTransactions.companyId, parseInt(companyId)));
    }

    if (type) {
      if (type !== 'credit' && type !== 'debit') {
        return NextResponse.json(
          { error: 'Type must be either credit or debit', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      conditions.push(eq(bankTransactions.type, type));
    }

    if (matched !== null && matched !== undefined) {
      if (matched === 'true') {
        conditions.push(isNotNull(bankTransactions.matchedPaymentId));
      } else if (matched === 'false') {
        conditions.push(isNull(bankTransactions.matchedPaymentId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bankTransactions.transactionDate))
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
    const { companyId, transactionDate, description, amount, type, reference, bankName, matchedPaymentId } = body;

    // Validate required fields
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required', code: 'MISSING_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (!transactionDate) {
      return NextResponse.json(
        { error: 'Transaction date is required', code: 'MISSING_TRANSACTION_DATE' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'credit' && type !== 'debit') {
      return NextResponse.json(
        { error: 'Type must be either credit or debit', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Validate amount is positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate transactionDate is valid date
    const dateCheck = new Date(transactionDate);
    if (isNaN(dateCheck.getTime())) {
      return NextResponse.json(
        { error: 'Transaction date must be a valid date', code: 'INVALID_DATE' },
        { status: 400 }
      );
    }

    // Validate companyId is valid integer
    const parsedCompanyId = parseInt(companyId);
    if (isNaN(parsedCompanyId)) {
      return NextResponse.json(
        { error: 'Company ID must be a valid integer', code: 'INVALID_COMPANY_ID' },
        { status: 400 }
      );
    }

    // Validate matchedPaymentId if provided
    let parsedMatchedPaymentId = null;
    if (matchedPaymentId !== undefined && matchedPaymentId !== null) {
      parsedMatchedPaymentId = parseInt(matchedPaymentId);
      if (isNaN(parsedMatchedPaymentId)) {
        return NextResponse.json(
          { error: 'Matched payment ID must be a valid integer', code: 'INVALID_MATCHED_PAYMENT_ID' },
          { status: 400 }
        );
      }
    }

    // Create new bank transaction
    const newTransaction = await db
      .insert(bankTransactions)
      .values({
        companyId: parsedCompanyId,
        transactionDate: transactionDate.trim(),
        description: description?.trim() || null,
        amount: parsedAmount,
        type: type.trim(),
        reference: reference?.trim() || null,
        bankName: bankName?.trim() || null,
        matchedPaymentId: parsedMatchedPaymentId,
        importedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
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

    const parsedId = parseInt(id);

    // Check if transaction exists
    const existingTransaction = await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.id, parsedId))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        { error: 'Bank transaction not found', code: 'TRANSACTION_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { companyId, transactionDate, description, amount, type, reference, bankName, matchedPaymentId } = body;

    const updates: Record<string, any> = {};

    // Validate and prepare updates
    if (companyId !== undefined) {
      const parsedCompanyId = parseInt(companyId);
      if (isNaN(parsedCompanyId)) {
        return NextResponse.json(
          { error: 'Company ID must be a valid integer', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }
      updates.companyId = parsedCompanyId;
    }

    if (transactionDate !== undefined) {
      const dateCheck = new Date(transactionDate);
      if (isNaN(dateCheck.getTime())) {
        return NextResponse.json(
          { error: 'Transaction date must be a valid date', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
      updates.transactionDate = transactionDate.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number', code: 'INVALID_AMOUNT' },
          { status: 400 }
        );
      }
      updates.amount = parsedAmount;
    }

    if (type !== undefined) {
      if (type !== 'credit' && type !== 'debit') {
        return NextResponse.json(
          { error: 'Type must be either credit or debit', code: 'INVALID_TYPE' },
          { status: 400 }
        );
      }
      updates.type = type.trim();
    }

    if (reference !== undefined) {
      updates.reference = reference?.trim() || null;
    }

    if (bankName !== undefined) {
      updates.bankName = bankName?.trim() || null;
    }

    if (matchedPaymentId !== undefined) {
      if (matchedPaymentId === null) {
        updates.matchedPaymentId = null;
      } else {
        const parsedMatchedPaymentId = parseInt(matchedPaymentId);
        if (isNaN(parsedMatchedPaymentId)) {
          return NextResponse.json(
            { error: 'Matched payment ID must be a valid integer', code: 'INVALID_MATCHED_PAYMENT_ID' },
            { status: 400 }
          );
        }
        updates.matchedPaymentId = parsedMatchedPaymentId;
      }
    }

    // Update bank transaction
    const updatedTransaction = await db
      .update(bankTransactions)
      .set(updates)
      .where(eq(bankTransactions.id, parsedId))
      .returning();

    return NextResponse.json(updatedTransaction[0], { status: 200 });
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

    const parsedId = parseInt(id);

    // Check if transaction exists
    const existingTransaction = await db
      .select()
      .from(bankTransactions)
      .where(eq(bankTransactions.id, parsedId))
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        { error: 'Bank transaction not found', code: 'TRANSACTION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete bank transaction
    const deleted = await db
      .delete(bankTransactions)
      .where(eq(bankTransactions.id, parsedId))
      .returning();

    return NextResponse.json(
      {
        message: 'Bank transaction deleted successfully',
        id: deleted[0].id,
        transaction: deleted[0],
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