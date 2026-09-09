'use server';

import { revalidatePath } from 'next/cache';

export async function revalidateApp() {
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/events');
    revalidatePath('/admin/events');
}
