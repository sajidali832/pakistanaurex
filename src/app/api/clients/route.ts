import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { clients, companies, user } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser || !currentUser.companyId) {
      return NextResponse.json(
        { error: 'User has no company associated', code: 'NO_COMPANY' },
        { status: 400 }
      );
    }

    const companyIdFromUser = currentUser.companyId;

    const searchParams = request.nextUrl.searchParams;

    const id = searchParams.get('id');

    // Single client by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const client = await db
        .select()
        .from(clients)
        .where(eq(clients.id, parseInt(id)))
        .where(eq(clients.companyId, companyIdFromUser))
        .limit(1);

      if (client.length === 0) {
        return NextResponse.json(
          { error: 'Client not found', code: 'CLIENT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(client[0]);
    }

    // List clients with pagination, search, and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const companyId = companyIdFromUser?.toString();

    let query = db.select().from(clients);

    const conditions = [];

    // Filter by the current user's companyId
    if (companyId) {
      if (isNaN(parseInt(companyId))) {
        return NextResponse.json(
          { error: 'Valid company ID is required', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(clients.companyId, parseInt(companyId)));
    }

    // Search by name or city
    if (search) {
      conditions.push(
        or(
          like(clients.name, `%${search}%`),
          like(clients.city, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
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
    const { companyId, name, nameUrdu, email, phone, address, city, ntnNumber, contactPerson, balance } = body;

    // Validate required fields
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required', code: 'MISSING_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(companyId))) {
      return NextResponse.json(
        { error: 'Valid company ID is required', code: 'INVALID_COMPANY_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    // Validate balance if provided
    if (balance !== undefined && balance !== null) {
      if (isNaN(parseFloat(balance))) {
        return NextResponse.json(
          { error: 'Balance must be a valid number', code: 'INVALID_BALANCE' },
          { status: 400 }
        );
      }
    }

    // Verify company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, parseInt(companyId)))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json(
        { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Prepare insert data
    const insertData = {
      companyId: parseInt(companyId),
      name: name.trim(),
      nameUrdu: nameUrdu && typeof nameUrdu === 'string' ? nameUrdu.trim() : null,
      email: email && typeof email === 'string' ? email.trim().toLowerCase() : null,
      phone: phone && typeof phone === 'string' ? phone.trim() : null,
      address: address && typeof address === 'string' ? address.trim() : null,
      city: city && typeof city === 'string' ? city.trim() : null,
      ntnNumber: ntnNumber && typeof ntnNumber === 'string' ? ntnNumber.trim() : null,
      contactPerson: contactPerson && typeof contactPerson === 'string' ? contactPerson.trim() : null,
      balance: balance !== undefined && balance !== null ? parseFloat(balance) : 0,
      createdAt: new Date().toISOString(),
    };

    const newClient = await db
      .insert(clients)
      .values(insertData)
      .returning();

    return NextResponse.json(newClient[0], { status: 201 });
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
    const { companyId, name, nameUrdu, email, phone, address, city, ntnNumber, contactPerson, balance } = body;

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (existingClient.length === 0) {
      return NextResponse.json(
        { error: 'Client not found', code: 'CLIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate fields if provided
    if (companyId !== undefined) {
      if (isNaN(parseInt(companyId))) {
        return NextResponse.json(
          { error: 'Valid company ID is required', code: 'INVALID_COMPANY_ID' },
          { status: 400 }
        );
      }

      // Verify company exists
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, parseInt(companyId)))
        .limit(1);

      if (company.length === 0) {
        return NextResponse.json(
          { error: 'Company not found', code: 'COMPANY_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { error: 'Name cannot be empty', code: 'INVALID_NAME' },
        { status: 400 }
      );
    }

    if (email !== undefined && email !== null && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
    }

    if (balance !== undefined && balance !== null && isNaN(parseFloat(balance))) {
      return NextResponse.json(
        { error: 'Balance must be a valid number', code: 'INVALID_BALANCE' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (companyId !== undefined) updateData.companyId = parseInt(companyId);
    if (name !== undefined) updateData.name = name.trim();
    if (nameUrdu !== undefined) updateData.nameUrdu = nameUrdu && typeof nameUrdu === 'string' ? nameUrdu.trim() : null;
    if (email !== undefined) updateData.email = email && typeof email === 'string' ? email.trim().toLowerCase() : null;
    if (phone !== undefined) updateData.phone = phone && typeof phone === 'string' ? phone.trim() : null;
    if (address !== undefined) updateData.address = address && typeof address === 'string' ? address.trim() : null;
    if (city !== undefined) updateData.city = city && typeof city === 'string' ? city.trim() : null;
    if (ntnNumber !== undefined) updateData.ntnNumber = ntnNumber && typeof ntnNumber === 'string' ? ntnNumber.trim() : null;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson && typeof contactPerson === 'string' ? contactPerson.trim() : null;
    if (balance !== undefined) updateData.balance = balance !== null ? parseFloat(balance) : 0;

    const updatedClient = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedClient[0]);
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

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (existingClient.length === 0) {
      return NextResponse.json(
        { error: 'Client not found', code: 'CLIENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(clients)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Client deleted successfully',
      id: deleted[0].id,
      client: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}