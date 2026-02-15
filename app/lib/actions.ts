'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
});

/* =======================================================
   TYPES
======================================================= */

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

/* =======================================================
   SCHEMAS
======================================================= */

const InvoiceSchema = z.object({
  customerId: z.string().min(1, {
    message: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
});

/* =======================================================
   CREATE
======================================================= */

export async function createInvoice(formData: FormData) {
  const validatedFields = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    redirect('/dashboard/invoices?error=validation');
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    console.error('Database error:', error);
    redirect('/dashboard/invoices?error=database');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* =======================================================
   UPDATE
======================================================= */

export async function updateInvoice(id: string, formData: FormData) {
  if (!id) {
    redirect('/dashboard/invoices?error=missing-id');
  }

  const validatedFields = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    redirect('/dashboard/invoices?error=validation');
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = Math.round(amount * 100);

  try {
    await sql`
      UPDATE invoices
      SET
        customer_id = ${customerId},
        amount = ${amountInCents},
        status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database error:', error);
    redirect('/dashboard/invoices?error=database');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/* =======================================================
   DELETE
======================================================= */

export async function deleteInvoice(id: string) {
  if (!id) {
    redirect('/dashboard/invoices?error=missing-id');
  }

  try {
    await sql`
      DELETE FROM invoices
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Database error:', error);
    redirect('/dashboard/invoices?error=database');
  }

  revalidatePath('/dashboard/invoices');
}

/* =======================================================
   AUTH (compatible con useActionState)
======================================================= */

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn('credentials', formData);
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }

    console.error(error);
    return 'Authentication failed.';
  }
}
