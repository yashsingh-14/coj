'use client';

import EventFormPage from '../[id]/page';

export default function NewEventPage() {
    return <EventFormPage params={Promise.resolve({ id: 'new' })} />;
}
