// ===================================================================
// PG & HOSTEL FINDER - SEARCH & FILTER LOGIC
// ===================================================================

let allProperties = [];

document.addEventListener('DOMContentLoaded', () => {
    initFromUrlParams();
    setupEventListeners();
    fetchAndFilterProperties();
});

function initFromUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    const gender = params.get('genderType');
    const maxRent = params.get('maxRent');
    const keyword = params.get('keyword');
    const roomType = params.get('roomType');
    const acOnly = params.get('acOnly');

    if (city) document.getElementById('filter-city').value = city;
    if (keyword) document.getElementById('filter-keyword').value = keyword;
    if (maxRent) {
        document.getElementById('filter-max-rent').value = maxRent;
        document.getElementById('budget-display').textContent = `₹${parseInt(maxRent).toLocaleString()}`;
    }
    if (gender) {
        const radio = document.querySelector(`input[name="genderFilter"][value="${gender}"]`);
        if (radio) radio.checked = true;
    }
    if (roomType) {
        const radio = document.querySelector(`input[name="roomTypeFilter"][value="${roomType}"]`);
        if (radio) radio.checked = true;
    }
    if (acOnly === 'true' || acOnly === '1') {
        const acSwitch = document.getElementById('filter-ac-only');
        if (acSwitch) acSwitch.checked = true;
    }
}

function setupEventListeners() {
    const form = document.getElementById('filter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            fetchAndFilterProperties();
        });
    }

    const maxRentInput = document.getElementById('filter-max-rent');
    if (maxRentInput) {
        maxRentInput.addEventListener('input', (e) => {
            document.getElementById('budget-display').textContent = `₹${parseInt(e.target.value).toLocaleString()}`;
            applyClientSideFilters();
        });
    }

    document.querySelectorAll('.filter-gender').forEach(r => {
        r.addEventListener('change', () => fetchAndFilterProperties());
    });

    document.querySelectorAll('.filter-room-type').forEach(r => {
        r.addEventListener('change', () => applyClientSideFilters());
    });

    const acSwitch = document.getElementById('filter-ac-only');
    if (acSwitch) {
        acSwitch.addEventListener('change', () => applyClientSideFilters());
    }

    document.querySelectorAll('.amenity-checkbox').forEach(c => {
        c.addEventListener('change', () => applyClientSideFilters());
    });

    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => applyClientSideFilters());
    }

    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filter-city').value = '';
            document.getElementById('filter-keyword').value = '';
            document.getElementById('gender-all').checked = true;
            const roomAll = document.getElementById('room-all');
            if (roomAll) roomAll.checked = true;
            const acOnlyCheck = document.getElementById('filter-ac-only');
            if (acOnlyCheck) acOnlyCheck.checked = false;
            document.getElementById('filter-max-rent').value = 30000;
            document.getElementById('budget-display').textContent = '₹30,000';
            document.querySelectorAll('.amenity-checkbox').forEach(c => c.checked = false);
            fetchAndFilterProperties();
        });
    }
}

async function fetchAndFilterProperties() {
    const city = document.getElementById('filter-city').value;
    const keyword = document.getElementById('filter-keyword').value;
    const gender = document.querySelector('input[name="genderFilter"]:checked')?.value || '';
    const maxRent = document.getElementById('filter-max-rent').value;

    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (gender) params.append('genderType', gender);
    if (keyword) params.append('keyword', keyword);
    if (maxRent && maxRent < 30000) params.append('maxRent', maxRent);

    const res = await API.get(`/properties?${params.toString()}`);
    if (res.success && res.data) {
        allProperties = [...res.data].reverse();
        applyClientSideFilters();
    } else {
        document.getElementById('search-results-container').innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger">Failed to load properties. Check backend connection.</p>
            </div>
        `;
    }
}

function applyClientSideFilters() {
    const maxRent = parseInt(document.getElementById('filter-max-rent').value);
    const selectedAmenities = Array.from(document.querySelectorAll('.amenity-checkbox:checked')).map(c => c.value);
    const sortBy = document.getElementById('sort-by').value;
    const selectedRoomType = document.querySelector('input[name="roomTypeFilter"]:checked')?.value || '';
    const acOnly = document.getElementById('filter-ac-only')?.checked;

    let filtered = allProperties.filter(p => {
        // Price filter
        if (p.rent > maxRent) return false;

        // AC Filter
        if (acOnly) {
            const hasAcInAmenities = p.amenities && p.amenities.some(a => a.toLowerCase().includes('ac') || a.toLowerCase().includes('air conditioning'));
            const hasAcInRooms = p.rooms && p.rooms.some(r => r.acAvailable === true);
            if (!hasAcInAmenities && !hasAcInRooms) return false;
        }

        // Room Sharing Type Filter
        if (selectedRoomType && p.rooms && p.rooms.length > 0) {
            const hasMatchingRoom = p.rooms.some(r => {
                if (selectedRoomType === 'SINGLE') return r.roomType === 'SINGLE' || r.capacity === 1;
                if (selectedRoomType === 'DOUBLE') return r.roomType === 'DOUBLE' || r.capacity === 2;
                if (selectedRoomType === 'TRIPLE') return r.roomType === 'TRIPLE' || r.roomType === 'FOUR_SHARING' || r.capacity >= 3;
                return true;
            });
            if (!hasMatchingRoom) return false;
        }

        // Amenities filter
        if (selectedAmenities.length > 0) {
            const propAmenities = p.amenities || [];
            const hasAll = selectedAmenities.every(a => 
                propAmenities.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
            );
            if (!hasAll) return false;
        }

        return true;
    });

    if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.rent - b.rent);
    } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.rent - a.rent);
    }

    renderResults(filtered);
}

function renderResults(properties) {
    const container = document.getElementById('search-results-container');
    const countDisplay = document.getElementById('results-count');

    countDisplay.textContent = `Showing ${properties.length} available PG/Hostel properties`;

    if (properties.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="py-4">
                    <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                    <h5 class="fw-bold mt-3">No accommodations match your criteria</h5>
                    <p class="text-muted">Try adjusting your budget, AC filter, or room sharing preferences.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = properties.map(p => {
        const genderBadgeClass = p.genderType === 'BOYS' ? 'badge-boys' : (p.genderType === 'GIRLS' ? 'badge-girls' : 'badge-coed');
        const genderLabel = p.genderType === 'BOYS' ? 'Boys PG' : (p.genderType === 'GIRLS' ? 'Girls PG' : 'Co-ed / Unisex');
        const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
        const selectedAmenities = Array.from(document.querySelectorAll('.amenity-checkbox:checked')).map(c => c.value);

        // Check if AC is available
        const hasAc = (p.amenities && p.amenities.some(a => a.toLowerCase().includes('ac') || a.toLowerCase().includes('air conditioning'))) ||
                      (p.rooms && p.rooms.some(r => r.acAvailable === true));

        // Format room types summary
        let roomTypesSummary = '';
        if (p.rooms && p.rooms.length > 0) {
            const types = [...new Set(p.rooms.map(r => {
                if (r.roomType === 'SINGLE') return 'Single';
                if (r.roomType === 'DOUBLE') return 'Double';
                if (r.roomType === 'TRIPLE') return 'Triple';
                if (r.roomType === 'FOUR_SHARING') return '4-Sharing';
                return 'Shared';
            }))];
            roomTypesSummary = types.join(' • ');
        }

        // WhatsApp direct link
        const rawDigits = (p.contactPhone || '9876543210').replace(/\D/g, '');
        const cleanPhone = rawDigits.length === 10 ? '91' + rawDigits : (rawDigits.length > 10 ? rawDigits : '919876543210');
        const waMsg = encodeURIComponent(`Hello! I saw "${p.propertyName}" in ${p.city} on PG & Hostel Finder. Is a room currently available?`);
        const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

        let displayAmenities = [...(p.amenities || [])];
        if (selectedAmenities.length > 0) {
            displayAmenities.sort((a, b) => {
                const aMatch = selectedAmenities.some(sa => a.toLowerCase().includes(sa.toLowerCase()));
                const bMatch = selectedAmenities.some(sa => b.toLowerCase().includes(sa.toLowerCase()));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
        }
        const visibleAmenities = displayAmenities.slice(0, 4);
        const remainingCount = (p.amenities || []).length - visibleAmenities.length;
        const amenitiesHtml = visibleAmenities.map(a => {
            const isMatched = selectedAmenities.some(sa => a.toLowerCase().includes(sa.toLowerCase()));
            const highlightClass = isMatched ? 'border border-primary fw-semibold text-primary bg-primary-subtle' : '';
            return `<span class="amenity-tag ${highlightClass}">${a}</span>`;
        }).join('') + (remainingCount > 0 ? `<span class="amenity-tag text-muted">+${remainingCount} more</span>` : '');

        return `
            <div class="col-md-6">
                <div class="property-card h-100 d-flex flex-column">
                    <div class="property-img-wrapper position-relative">
                        <img src="${imgUrl}" alt="${p.propertyName}" loading="lazy">
                        <span class="gender-badge ${genderBadgeClass}">${genderLabel}</span>
                        ${hasAc ? '<span class="badge bg-info text-white shadow-sm position-absolute" style="top: 12px; right: 12px; font-size: 0.75rem;"><i class="bi bi-snow me-1"></i>AC Available</span>' : ''}
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

                        ${roomTypesSummary ? `
                        <div class="mb-2">
                            <span class="badge bg-light text-secondary border small"><i class="bi bi-door-closed me-1"></i>${roomTypesSummary}</span>
                        </div>
                        ` : ''}

                        <div class="mb-3">
                            ${amenitiesHtml}
                        </div>
                        <div class="mt-auto pt-2 border-top d-flex justify-content-between align-items-center gap-2">
                            <small class="text-muted text-truncate"><i class="bi bi-cash me-1"></i>Dep: ₹${(p.deposit || 0).toLocaleString()}</small>
                            <div class="d-flex gap-2">
                                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-success fw-semibold d-flex align-items-center gap-1" title="Chat with owner on WhatsApp">
                                    <i class="bi bi-whatsapp"></i> Chat
                                </a>
                                <a href="property-details.html?id=${p.id}" class="btn btn-sm btn-primary fw-semibold">
                                    View Details
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
