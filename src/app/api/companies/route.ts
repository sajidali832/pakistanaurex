import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single company by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, parseInt(id)))
        .limit(1);

      if (company.length === 0) {
        return NextResponse.json(
          { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(company[0], { status: 200 });
    }

    // List all companies with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(companies);

    if (search) {
      query = query.where(
        or(
          like(companies.name, `%${search}%`),
          like(companies.nameUrdu, `%${search}%`),
          like(companies.city, `%${search}%`)
        )
      );
    }

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

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email && body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    // Prepare company data with sanitized inputs
    const companyData = {
      name: body.name.trim(),
      nameUrdu: body.nameUrdu ? body.nameUrdu.trim() : null,
      ntnNumber: body.ntnNumber ? body.ntnNumber.trim() : null,
      strnNumber: body.strnNumber ? body.strnNumber.trim() : null,
      address: body.address ? body.address.trim() : null,
      city: body.city ? body.city.trim() : null,
      phone: body.phone ? body.phone.trim() : null,
      email: body.email ? body.email.trim().toLowerCase() : null,
      logoUrl: body.logoUrl ? body.logoUrl.trim() : null,
      bankName: body.bankName ? body.bankName.trim() : null,
      bankAccountNumber: body.bankAccountNumber ? body.bankAccountNumber.trim() : null,
      bankIban: body.bankIban ? body.bankIban.trim() : null,
      defaultCurrency: body.defaultCurrency ? body.defaultCurrency.trim() : 'PKR',
      createdAt: new Date().toISOString(),
    };

    const newCompany = await db
      .insert(companies)
      .values(companyData)
      .returning();

    return NextResponse.json(newCompany[0], { status: 201 });
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

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate name if provided
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json(
        { error: 'Company name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (body.email !== undefined && body.email !== null && body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    // Prepare update data with sanitized inputs
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nameUrdu !== undefined) updateData.nameUrdu = body.nameUrdu ? body.nameUrdu.trim() : null;
    if (body.ntnNumber !== undefined) updateData.ntnNumber = body.ntnNumber ? body.ntnNumber.trim() : null;
    if (body.strnNumber !== undefined) updateData.strnNumber = body.strnNumber ? body.strnNumber.trim() : null;
    if (body.address !== undefined) updateData.address = body.address ? body.address.trim() : null;
    if (body.city !== undefined) updateData.city = body.city ? body.city.trim() : null;
    if (body.phone !== undefined) updateData.phone = body.phone ? body.phone.trim() : null;
    if (body.email !== undefined) updateData.email = body.email ? body.email.trim().toLowerCase() : null;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl ? body.logoUrl.trim() : null;
    if (body.bankName !== undefined) updateData.bankName = body.bankName ? body.bankName.trim() : null;
    if (body.bankAccountNumber !== undefined) updateData.bankAccountNumber = body.bankAccountNumber ? body.bankAccountNumber.trim() : null;
    if (body.bankIban !== undefined) updateData.bankIban = body.bankIban ? body.bankIban.trim() : null;
    if (body.defaultCurrency !== undefined) updateData.defaultCurrency = body.defaultCurrency.trim();

    const updatedCompany = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedCompany[0], { status: 200 });
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

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(id)))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(companies)
      .where(eq(companies.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Company deleted successfully',
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