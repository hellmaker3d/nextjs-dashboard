import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {

    const { id } = await params;

    // Traemos la factura y los clientes
    const invoice = await fetchInvoiceById(id);
    const customers = await fetchCustomers();



    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            {/* Solo renderizamos el formulario si invoice existe */}
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}
