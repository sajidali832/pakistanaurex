import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate role
function isValidRole(role: string): boolean {
  return ['owner', 'accountant', 'staff'].includes(role);
}

// Helper function to exclude passwordHash from response
function excludePasswordHash(user: any) {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(excludePasswordHash(user[0]));
    }

    // List users with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const companyId = searchParams.get('companyId');
    const role = searchParams.get('role');

    let query = db.select().from(users);

    // Build conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (companyId) {
      conditions.push(eq(users.companyId, parseInt(companyId)));
    }

    if (role) {
      if (!isValidRole(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be one of: owner, accountant, staff', code: 'INVALID_ROLE' },
          { status: 400 }
        );
      }
      conditions.push(eq(users.role, role));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Exclude passwordHash from all results
    const sanitizedResults = results.map(excludePasswordHash);

    return NextResponse.json(sanitizedResults);
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Trim string inputs
    const email = body.email?.trim();
    const name = body.name?.trim();
    const passwordHash = body.passwordHash;
    const role = body.role?.trim();
    const companyId = body.companyId;
    const phone = body.phone?.trim();
    const languagePreference = body.languagePreference?.trim() || 'en';

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'EMAIL_REQUIRED' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'NAME_REQUIRED' },
        { status: 400 }
      );
    }

    if (!passwordHash) {
      return NextResponse.json(
        { error: 'Password hash is required', code: 'PASSWORD_HASH_REQUIRED' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required', code: 'ROLE_REQUIRED' },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: owner, accountant, staff', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        companyId: companyId ? parseInt(companyId) : null,
        phone: phone || null,
        languagePreference,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(excludePasswordHash(newUser[0]), { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Validate and add fields if provided
    if (body.email !== undefined) {
      const email = body.email.trim();
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL_FORMAT' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const emailCheck = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (emailCheck.length > 0 && emailCheck[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'EMAIL_EXISTS' },
          { status: 400 }
        );
      }

      updates.email = email.toLowerCase();
    }

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json(
          { error: 'Name cannot be empty', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name;
    }

    if (body.role !== undefined) {
      if (!isValidRole(body.role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be one of: owner, accountant, staff', code: 'INVALID_ROLE' },
          { status: 400 }
        );
      }
      updates.role = body.role;
    }

    if (body.companyId !== undefined) {
      updates.companyId = body.companyId ? parseInt(body.companyId) : null;
    }

    if (body.phone !== undefined) {
      updates.phone = body.phone ? body.phone.trim() : null;
    }

    if (body.languagePreference !== undefined) {
      updates.languagePreference = body.languagePreference.trim();
    }

    if (body.passwordHash !== undefined) {
      updates.passwordHash = body.passwordHash;
    }

    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(id)))
      .returning();

    return NextResponse.json(excludePasswordHash(updated[0]));
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
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

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.delete(users).where(eq(users.id, parseInt(id))).returning();

    return NextResponse.json({
      message: 'User deleted successfully',
      id: parseInt(id),
    });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}