'use client';

import ArtistFormPage from '../[id]/page';

export default function NewArtistPage() {
    return <ArtistFormPage params={Promise.resolve({ id: 'new' })} />;
}
