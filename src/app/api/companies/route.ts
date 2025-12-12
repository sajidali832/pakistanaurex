import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { companies, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
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

    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json(
        { error: 'Company name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (body.email !== undefined && body.email !== null && body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

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
      .where(eq(companies.id, companyId))
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