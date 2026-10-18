// ===================================================================
// PG & HOSTEL FINDER - HOMEPAGE LOGIC
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProperties();
    setupHeroSearch();
});

async function loadFeaturedProperties() {
    const container = document.getElementById('featured-properties-container');
    if (!container) return;

    const res = await API.get('/properties');
    if (!res.success || !res.data || res.data.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <p class="text-muted">No properties found. Be the first to list one!</p>
            </div>
        `;
        return;
    }

    // Show most recently added properties first (up to 8)
    const properties = [...res.data].reverse().slice(0, 8);
    container.innerHTML = properties.map(p => createPropertyCard(p)).join('');
}

function createPropertyCard(p) {
    const genderBadgeClass = p.genderType === 'BOYS' ? 'badge-boys' : (p.genderType === 'GIRLS' ? 'badge-girls' : 'badge-coed');
    const genderLabel = p.genderType === 'BOYS' ? 'Boys PG' : (p.genderType === 'GIRLS' ? 'Girls PG' : 'Co-ed / Unisex');
    const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
    const amenitiesHtml = (p.amenities || []).slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join('');

    return `
        <div class="col-lg-3 col-md-6">
            <div class="property-card">
                <div class="property-img-wrapper">
                    <img src="${imgUrl}" alt="${p.propertyName}" loading="lazy">
                    <span class="gender-badge ${genderBadgeClass}">${genderLabel}</span>
                    <span class="price-tag">₹${p.rent.toLocaleString()}/mo</span>
                </div>
                <div class="p-3 d-flex flex-column flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-primary small fw-bold"><i class="bi bi-geo-alt me-1"></i>${p.city}</span>
                        <span class="badge bg-light text-dark border">
                            <i class="bi bi-star-fill text-warning me-1"></i>${p.averageRating ? p.averageRating : '4.5'}
                        </span>
                    </div>
                    <h5 class="fw-bold mb-1 fs-6 text-truncate" title="${p.propertyName}">${p.propertyName}</h5>
                    <p class="text-muted small text-truncate mb-2" title="${p.address}">${p.address}</p>
                    <div class="mb-3">
                        ${amenitiesHtml}
                    </div>
                    <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                        <small class="text-muted"><i class="bi bi-door-open me-1"></i>${p.totalAvailableRooms || 'Multiple'} beds</small>
                        <a href="property-details.html?id=${p.id}" class="btn btn-sm btn-primary fw-semibold">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupHeroSearch() {
    const form = document.getElementById('hero-search-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = document.getElementById('search-city').value;
        const gender = document.getElementById('search-gender').value;
        const budget = document.getElementById('search-budget').value;

        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (gender) params.append('genderType', gender);
        if (budget) params.append('maxRent', budget);

        window.location.href = `search.html?${params.toString()}`;
    });
}
