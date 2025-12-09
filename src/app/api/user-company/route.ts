import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { user, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // First, check if a user record exists for this Clerk user
    let currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // If no user record exists, create one (first time Clerk user logs in)
    if (currentUser.length === 0) {
      const newUser = await db
        .insert(user)
        .values({
          id: userId,
          name: 'User',
          email: '',
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      currentUser = newUser;
    }

    const userData = currentUser[0];

    if (userData.companyId) {
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, userData.companyId))
        .limit(1);

      if (company.length === 0) {
        return NextResponse.json(
          { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(company[0], { status: 200 });
    }

    // Create a new company for this user
    const newCompany = await db
      .insert(companies)
      .values({
        name: `My Business`,
        nameUrdu: null,
        ntnNumber: null,
        strnNumber: null,
        address: null,
        city: null,
        phone: null,
        email: null,
        logoUrl: null,
        bankName: null,
        bankAccountNumber: null,
        bankIban: null,
        defaultCurrency: 'PKR',
        createdAt: new Date().toISOString(),
      })
      .returning();

    await db
      .update(user)
      .set({ companyId: newCompany[0].id })
      .where(eq(user.id, userId));

    return NextResponse.json(newCompany[0], { status: 200 });
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const userData = currentUser[0];

    if (!userData.companyId) {
      return NextResponse.json(
        { error: 'User has no company associated', code: 'NO_COMPANY' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      nameUrdu,
      ntnNumber,
      strnNumber,
      address,
      city,
      phone,
      email,
      logoUrl,
      bankName,
      bankAccountNumber,
      bankIban,
      defaultCurrency,
    } = body;

    if (name !== undefined && typeof name === 'string' && name.trim() === '') {
      return NextResponse.json(
        { error: 'Company name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (email !== undefined && email !== null && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    const updates: Partial<typeof companies.$inferInsert> = {};

    if (name !== undefined) updates.name = name.trim();
    if (nameUrdu !== undefined) updates.nameUrdu = nameUrdu ? nameUrdu.trim() : null;
    if (ntnNumber !== undefined) updates.ntnNumber = ntnNumber ? ntnNumber.trim() : null;
    if (strnNumber !== undefined) updates.strnNumber = strnNumber ? strnNumber.trim() : null;
    if (address !== undefined) updates.address = address ? address.trim() : null;
    if (city !== undefined) updates.city = city ? city.trim() : null;
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (email !== undefined) updates.email = email ? email.trim().toLowerCase() : null;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl ? logoUrl.trim() : null;
    if (bankName !== undefined) updates.bankName = bankName ? bankName.trim() : null;
    if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber ? bankAccountNumber.trim() : null;
    if (bankIban !== undefined) updates.bankIban = bankIban ? bankIban.trim() : null;
    if (defaultCurrency !== undefined) updates.defaultCurrency = defaultCurrency.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updatedCompany = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, userData.companyId))
      .returning();

    if (updatedCompany.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCompany[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}