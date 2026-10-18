// ===================================================================
// PG & HOSTEL FINDER - PROPERTY DETAILS & BOOKING LOGIC
// ===================================================================

let currentProperty = null;
let selectedRoom = null;
let bookingModal = null;

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('bookingModal');
    if (modalElement) {
        bookingModal = new bootstrap.Modal(modalElement);
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        loadPropertyDetails(id);
    } else {
        showAlert('Invalid property selected.', 'danger');
    }

    setupBookingForm();
});

async function loadPropertyDetails(id) {
    const container = document.getElementById('property-details-container');
    const res = await API.get(`/properties/${id}`);

    if (!res.success || !res.data) {
        container.innerHTML = `
            <div class="text-center py-5">
                <h4 class="text-danger">Property not found</h4>
                <a href="search.html" class="btn btn-outline-primary mt-3">Back to Search</a>
            </div>
        `;
        return;
    }

    currentProperty = res.data;

    // Fetch fresh reviews explicitly to guarantee real-time updates
    try {
        const reviewsRes = await API.get(`/reviews/property/${id}`);
        if (reviewsRes.success && Array.isArray(reviewsRes.data)) {
            currentProperty.reviews = reviewsRes.data;
            if (currentProperty.reviews.length > 0) {
                const sum = currentProperty.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
                currentProperty.averageRating = Math.round((sum / currentProperty.reviews.length) * 10) / 10;
            }
        }
    } catch (e) {}

    renderPropertyPage(currentProperty);
}

function renderPropertyPage(p) {
    const container = document.getElementById('property-details-container');
    const genderBadgeClass = p.genderType === 'BOYS' ? 'badge-boys' : (p.genderType === 'GIRLS' ? 'badge-girls' : 'badge-coed');
    const genderLabel = p.genderType === 'BOYS' ? 'Boys PG / Hostel' : (p.genderType === 'GIRLS' ? 'Girls PG / Hostel' : 'Co-ed / Unisex Accommodation');
    const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80';

    const amenitiesList = (p.amenities || []).map(a => `
        <div class="col-md-4 col-6 mb-2">
            <span class="text-secondary fw-semibold"><i class="bi bi-check-circle-fill text-success me-2"></i>${a}</span>
        </div>
    `).join('');

    const roomsHtml = (p.rooms && p.rooms.length > 0) ? p.rooms.map(r => `
        <div class="col-md-6 mb-3">
            <div class="room-selection-card ${r.availableRooms <= 0 ? 'opacity-75 bg-light' : ''}" onclick="selectRoom(${r.id})">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="fw-bold mb-0 text-capitalize">${formatRoomType(r.roomType)} (Room ${r.roomNumber || 'A'})</h6>
                    <span class="badge ${r.availableRooms > 0 ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger'}">
                        ${r.availableRooms > 0 ? `${r.availableRooms} Available` : 'Sold Out'}
                    </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fs-5 fw-bold text-primary">₹${r.rent.toLocaleString()}</span>
                        <small class="text-muted"> / month</small>
                    </div>
                    <div>
                        ${r.acAvailable ? '<span class="badge bg-info-subtle text-info me-1"><i class="bi bi-snow"></i> AC</span>' : ''}
                        <span class="badge bg-light text-dark"><i class="bi bi-person"></i> Max ${r.capacity}</span>
                    </div>
                </div>
                ${r.availableRooms > 0 ? `
                    <button type="button" class="btn btn-outline-primary btn-sm w-100 mt-3 fw-semibold">
                        Select this Room
                    </button>
                ` : `
                    <button type="button" class="btn btn-secondary btn-sm w-100 mt-3" disabled>
                        Currently Unavailable
                    </button>
                `}
            </div>
        </div>
    `).join('') : '<p class="text-muted">No rooms currently configured for this property.</p>';

    const currentUser = Auth.getUser();
    let myReview = null;
    if (currentUser && p.reviews && p.reviews.length > 0) {
        myReview = p.reviews.find(r => 
            (r.user && r.user.name && currentUser.name && r.user.name.toLowerCase() === currentUser.name.toLowerCase()) ||
            (r.user && r.user.id && currentUser.id && r.user.id == currentUser.id) ||
            (r.user && r.user.email && currentUser.email && r.user.email.toLowerCase() === currentUser.email.toLowerCase())
        );
    }

    const reviewsHtml = (p.reviews && p.reviews.length > 0) ? p.reviews.map(rev => {
        const isMyReview = currentUser && rev.user && (
            (rev.user.name && currentUser.name && rev.user.name.toLowerCase() === currentUser.name.toLowerCase()) ||
            (rev.user.id && currentUser.id && rev.user.id == currentUser.id)
        );
        return `
            <div class="border-bottom pb-3 mb-3 ${isMyReview ? 'bg-light p-2 rounded-3' : ''}">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <div>
                        <strong class="text-dark">${rev.user ? rev.user.name : 'Verified Resident'}</strong>
                        ${isMyReview ? '<span class="badge bg-primary-subtle text-primary ms-2 border"><i class="bi bi-person-check me-1"></i>Your Review</span>' : ''}
                    </div>
                    <div>
                        ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                        <span class="text-warning fw-bold ms-1">${rev.rating}/5</span>
                    </div>
                </div>
                <p class="text-muted small mb-1">${rev.comment || 'Good stay!'}</p>
                <small class="text-muted">${rev.reviewDate ? rev.reviewDate.substring(0, 10) : 'Recent'}</small>
            </div>
        `;
    }).join('') : '<p class="text-muted">No reviews yet. Be the first to review this property after your stay!</p>';

    container.innerHTML = `
        <div class="row g-4">
            <!-- Left Column: Details -->
            <div class="col-lg-8">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                        <li class="breadcrumb-item"><a href="search.html?city=${encodeURIComponent(p.city)}">${p.city}</a></li>
                        <li class="breadcrumb-item active">${p.propertyName}</li>
                    </ol>
                </nav>

                <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                    <img src="${imgUrl}" alt="${p.propertyName}" style="max-height: 420px; width: 100%; object-fit: cover;">
                </div>

                <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="gender-badge ${genderBadgeClass} position-static d-inline-block mb-2">${genderLabel}</span>
                            <h2 class="fw-bold mb-1">${p.propertyName}</h2>
                            <p class="text-muted mb-2"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${p.address}, ${p.city} - ${p.pincode || ''}</p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-warning text-dark fs-6 px-3 py-2">
                                <i class="bi bi-star-fill text-white me-1"></i>${p.averageRating} / 5
                            </span>
                        </div>
                    </div>

                    <hr class="my-3">

                    <h5 class="fw-bold mb-3">About this Accommodation</h5>
                    <p class="text-muted" style="line-height: 1.7;">${p.description || 'Comfortable and affordable living space for students and professionals.'}</p>

                    <h5 class="fw-bold mt-4 mb-3">Amenities &amp; Facilities</h5>
                    <div class="row">
                        ${amenitiesList}
                    </div>

                    <h5 class="fw-bold mt-4 mb-2">Rules &amp; Restrictions</h5>
                    <div class="p-3 bg-light rounded-3 text-muted small">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>${p.rules || 'Standard rules apply. Gate timings and guest policy to be verified with owner.'}
                    </div>
                </div>

                <!-- Available Rooms Section -->
                <div class="card border-0 shadow-sm p-4 rounded-4 mb-4" id="rooms-section">
                    <h5 class="fw-bold mb-1">Available Room Types</h5>
                    <p class="text-muted small mb-4">Select a room type to send an instant booking request</p>
                    <div class="row">
                        ${roomsHtml}
                    </div>
                </div>

                <!-- Reviews Section -->
                <div class="card border-0 shadow-sm p-4 rounded-4 mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold mb-0">Ratings &amp; Reviews</h5>
                    </div>
                    <div id="reviews-list">
                        ${reviewsHtml}
                    </div>

                    <!-- Add / Edit Review Box -->
                    <div class="mt-4 pt-3 border-top">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold mb-0 ${myReview ? 'text-primary' : ''}">
                                ${myReview ? '<i class="bi bi-pencil-square me-1"></i>Update / Change Your Review' : 'Leave a Review'}
                            </h6>
                            ${myReview ? '<span class="badge bg-primary-subtle text-primary border"><i class="bi bi-check-circle me-1"></i>Already Reviewed</span>' : ''}
                        </div>
                        ${myReview ? '<p class="small text-muted mb-2">Aap apna rating ya review badal kar <strong>Update Review</strong> click karein:</p>' : ''}
                        <form id="add-review-form" class="row g-2">
                            <div class="col-md-3">
                                <select id="review-rating" class="form-select form-select-sm" required>
                                    <option value="5" ${myReview && myReview.rating == 5 ? 'selected' : ''}>★★★★★ (5 Stars)</option>
                                    <option value="4" ${myReview && myReview.rating == 4 ? 'selected' : (!myReview ? '' : '')}>★★★★☆ (4 Stars)</option>
                                    <option value="3" ${myReview && myReview.rating == 3 ? 'selected' : ''}>★★★☆☆ (3 Stars)</option>
                                    <option value="2" ${myReview && myReview.rating == 2 ? 'selected' : ''}>★★☆☆☆ (2 Stars)</option>
                                    <option value="1" ${myReview && myReview.rating == 1 ? 'selected' : ''}>★☆☆☆☆ (1 Star)</option>
                                </select>
                            </div>
                            <div class="col-md-7">
                                <input type="text" id="review-comment" class="form-control form-control-sm" placeholder="Write your experience..." value="${myReview ? (myReview.comment || '').replace(/"/g, '&quot;') : ''}" required>
                            </div>
                            <div class="col-md-2 d-grid">
                                <button type="submit" class="btn ${myReview ? 'btn-primary' : 'btn-outline-primary'} btn-sm fw-semibold">
                                    ${myReview ? '<i class="bi bi-check2 me-1"></i>Update' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Right Column: Sticky Booking / Owner Contact Card -->
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-top" style="top: 90px;">
                    <div class="mb-3">
                        <span class="text-muted small">Rent starts at</span>
                        <div class="d-flex align-items-baseline gap-1">
                            <h3 class="fw-bold text-primary mb-0">₹${p.rent.toLocaleString()}</h3>
                            <span class="text-muted">/ month</span>
                        </div>
                        <small class="text-muted">Security Deposit: ₹${(p.deposit || 0).toLocaleString()}</small>
                    </div>

                    <hr>

                    <div class="mb-4">
                        <h6 class="fw-bold mb-2"><i class="bi bi-person-badge text-primary me-2"></i>Owner Contact</h6>
                        <p class="mb-1 fw-semibold text-dark">${p.owner ? p.owner.name : 'Property Manager'}</p>
                        <p class="mb-1 text-muted small"><i class="bi bi-telephone me-2"></i>${p.contactPhone || 'Available upon request'}</p>
                        <p class="mb-3 text-muted small"><i class="bi bi-envelope me-2"></i>${p.contactEmail || 'Available upon request'}</p>

                        <!-- WhatsApp Direct Chat Button -->
                        ${(() => {
                            const rawPhone = (p.contactPhone || '9876543210').replace(/\D/g, '');
                            const cleanPhone = rawPhone.length === 10 ? '91' + rawPhone : (rawPhone.length > 10 ? rawPhone : '919876543210');
                            const waText = encodeURIComponent(`Hello! I saw your accommodation "${p.propertyName}" in ${p.city} on PG & Hostel Finder. I want to inquire about room availability and rent.`);
                            return `
                                <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100 fw-bold shadow-sm mb-2 d-flex align-items-center justify-content-center gap-2 text-white" style="padding: 10px 14px;">
                                    <i class="bi bi-whatsapp fs-5"></i>
                                    <span>Chat on WhatsApp</span>
                                </a>
                                ${p.contactPhone ? `
                                <a href="tel:${p.contactPhone}" class="btn btn-outline-secondary btn-sm w-100 fw-semibold mb-2">
                                    <i class="bi bi-telephone-outbound me-1"></i>Direct Call (${p.contactPhone})
                                </a>
                                ` : ''}
                            `;
                        })()}
                    </div>

                    <a href="#rooms-section" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm mb-2">
                        <i class="bi bi-calendar-check me-2"></i>Book Room
                    </a>
                    <p class="text-center text-muted small mb-0">
                        <i class="bi bi-shield-check text-success me-1"></i>No advance fee before owner confirmation
                    </p>
                </div>
            </div>
        </div>
    `;

    setupReviewForm();
}

function selectRoom(roomId) {
    if (!Auth.isLoggedIn()) {
        showAlert('Please log in as a student to book a room.', 'warning');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        return;
    }

    const room = currentProperty.rooms.find(r => r.id === roomId);
    if (!room || room.availableRooms <= 0) {
        showAlert('This room type is currently full.', 'danger');
        return;
    }

    selectedRoom = room;
    document.getElementById('modal-property-name').textContent = currentProperty.propertyName;
    document.getElementById('modal-room-summary').textContent = `Room Type: ${formatRoomType(room.roomType)} (Room ${room.roomNumber}) - ₹${room.rent.toLocaleString()}/month`;
    document.getElementById('modal-property-id').value = currentProperty.id;
    document.getElementById('modal-room-id').value = room.id;

    // Default check-in date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('modal-checkin-date').value = tomorrow.toISOString().split('T')[0];

    bookingModal.show();
}

function setupBookingForm() {
    const form = document.getElementById('booking-request-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        if (!user) {
            showAlert('Please log in first.', 'danger');
            return;
        }

        const propertyId = document.getElementById('modal-property-id').value;
        const roomId = document.getElementById('modal-room-id').value;
        const checkInDate = document.getElementById('modal-checkin-date').value;
        const durationMonths = parseInt(document.getElementById('modal-duration').value);
        const remarks = document.getElementById('modal-remarks').value;

        const payload = {
            userId: user.id,
            propertyId: parseInt(propertyId),
            roomId: parseInt(roomId),
            checkInDate: checkInDate,
            durationMonths: durationMonths,
            remarks: remarks
        };

        const submitBtn = document.getElementById('btn-submit-booking');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting...';

        const res = await API.post('/bookings', payload);
        submitBtn.disabled = false;
        submitBtn.innerText = 'Confirm & Submit Request';

        if (res.success) {
            bookingModal.hide();
            showAlert('Booking request submitted successfully! You can track status on your dashboard.', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard-user.html';
            }, 1200);
        } else {
            showAlert(res.message || 'Failed to submit booking request.', 'danger');
        }
    });
}

function setupReviewForm() {
    const form = document.getElementById('add-review-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        if (!user) {
            showAlert('Please log in to submit or change a review.', 'warning');
            return;
        }

        const rating = parseInt(document.getElementById('review-rating').value);
        const comment = document.getElementById('review-comment').value.trim();
        if (!comment) {
            showAlert('Please enter your review feedback.', 'warning');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Saving...';
        }

        const res = await API.post('/reviews', {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            propertyId: parseInt(currentProperty.id),
            rating: rating,
            comment: comment
        });

        if (submitBtn) submitBtn.disabled = false;

        if (res.success) {
            showAlert('Thank you! Your review has been saved successfully.', 'success');
            await loadPropertyDetails(currentProperty.id);
        } else {
            showAlert(res.message || 'Failed to submit review.', 'danger');
        }
    });
}

function formatRoomType(type) {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
