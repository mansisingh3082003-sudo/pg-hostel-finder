// ===================================================================
// PG & HOSTEL FINDER - OWNER DASHBOARD LOGIC
// ===================================================================

let currentOwner = null;
let deleteOwnerModalInstance = null;
let pendingOwnerDeleteId = null;

function getAddPropertyModal() {
    const el = document.getElementById('addPropertyModal');
    if (!el || typeof bootstrap === 'undefined') return null;
    return bootstrap.Modal.getOrCreateInstance(el);
}

function openAddPropertyModal() {
    prepareAddPropertyModal();
    const modal = getAddPropertyModal();
    if (modal) modal.show();
}

function hideAddPropertyModal() {
    const modal = getAddPropertyModal();
    if (modal) {
        try { modal.hide(); } catch (e) {}
    }
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
        document.body.style.removeProperty('overflow');
    }, 300);
}

function prepareAddPropertyModal() {
    if (currentOwner) {
        const emailInput = document.getElementById('prop-email');
        if (emailInput && (!emailInput.value || emailInput.value === 'owner@example.com')) {
            emailInput.value = currentOwner.email || '';
        }
        const phoneInput = document.getElementById('prop-phone');
        if (phoneInput && !phoneInput.value) {
            phoneInput.value = currentOwner.phone || '';
        }
    }
}

window.openAddPropertyModal = openAddPropertyModal;
window.prepareAddPropertyModal = prepareAddPropertyModal;
window.hideAddPropertyModal = hideAddPropertyModal;

document.addEventListener('DOMContentLoaded', () => {
    currentOwner = Auth.requireAuth(['OWNER', 'ADMIN']);
    if (!currentOwner) return;

    if (currentOwner.name) {
        const nameEl = document.getElementById('owner-display-name');
        if (nameEl) nameEl.textContent = currentOwner.name;
    }
    if (currentOwner.email) {
        const emailEl = document.getElementById('owner-display-email');
        if (emailEl) emailEl.textContent = currentOwner.email;
    }

    const deleteOwnerModalEl = document.getElementById('deleteOwnerPropertyModal');
    if (deleteOwnerModalEl && typeof bootstrap !== 'undefined') {
        deleteOwnerModalInstance = bootstrap.Modal.getOrCreateInstance(deleteOwnerModalEl);
    }

    const confirmOwnerDeleteBtn = document.getElementById('btn-confirm-owner-delete');
    if (confirmOwnerDeleteBtn) {
        confirmOwnerDeleteBtn.addEventListener('click', executeDeleteOwnerProperty);
    }

    loadIncomingRequests();
    loadOwnerProperties();
    setupForms();
});

async function loadIncomingRequests() {
    const tbody = document.getElementById('incoming-requests-body');
    const countDisplay = document.getElementById('incoming-count');

    const ownerId = (currentOwner && currentOwner.id) ? currentOwner.id : 2;
    const ownerEmail = encodeURIComponent((currentOwner && currentOwner.email) ? currentOwner.email : '');
    const res = await API.get(`/bookings/owner/${ownerId}?ownerEmail=${ownerEmail}`);
    if (!res.success || !res.data || res.data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox fs-2 d-block mb-1 text-secondary"></i>
                    No booking requests received yet.
                </td>
            </tr>
        `;
        countDisplay.textContent = '0 Requests';
        return;
    }

    const requests = res.data;
    countDisplay.textContent = `${requests.length} Requests Total`;

    tbody.innerHTML = requests.map(b => {
        const studentName = b.user ? b.user.name : 'Unknown';
        const studentPhone = b.user && b.user.phone ? b.user.phone : 'Not provided';
        const propName = b.property ? b.property.propertyName : 'My Property';
        const roomType = b.room ? formatRoomType(b.room.roomType) : 'Standard';
        const roomNum = b.room && b.room.roomNumber ? `(${b.room.roomNumber})` : '';

        const isPaid = b.paymentStatus === 'PAID';
        const payBadge = isPaid 
            ? `<div class="mt-1"><span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1"></i>Paid: ₹${(b.amountPaid || 1000).toLocaleString()}</span></div>`
            : (b.status === 'APPROVED' ? `<div class="mt-1"><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Payment Due</span></div>` : '');

        return `
            <tr>
                <td class="fw-bold">#BK-${b.id}</td>
                <td>
                    <div class="fw-bold text-dark">${studentName}</div>
                    <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${studentPhone}</div>
                </td>
                <td><span class="badge bg-light text-dark border">${propName}</span></td>
                <td>${roomType} ${roomNum}</td>
                <td>${b.checkInDate}</td>
                <td>${b.durationMonths || 1} mo</td>
                <td>
                    <span class="status-badge status-${b.status}">${b.status}</span>
                    ${payBadge}
                </td>
                <td>
                    ${b.status === 'PENDING' ? `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-success fw-semibold" onclick="handleBookingAction(${b.id}, 'APPROVED')">
                                <i class="bi bi-check-lg me-1"></i>Accept
                            </button>
                            <button class="btn btn-outline-danger" onclick="handleBookingAction(${b.id}, 'REJECTED')">
                                <i class="bi bi-x-lg me-1"></i>Reject
                            </button>
                        </div>
                    ` : `
                        <span class="small text-muted">Completed</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

async function handleBookingAction(bookingId, status) {
    const actionText = status === 'APPROVED' ? 'accept' : 'reject';
    if (!confirm(`Are you sure you want to ${actionText} this booking request?`)) return;

    const res = await API.patch(`/bookings/${bookingId}/status?status=${status}&remarks=Updated by property owner`);
    if (res.success) {
        showAlert(`Booking request ${status.toLowerCase()} successfully!`, 'success');
        loadIncomingRequests();
        loadOwnerProperties(); // Refresh room counts
    } else {
        showAlert(res.message || 'Operation failed.', 'danger');
    }
}

async function loadOwnerProperties() {
    const container = document.getElementById('owner-properties-container');
    const ownerId = (currentOwner && currentOwner.id) ? currentOwner.id : 2;
    const ownerEmail = encodeURIComponent((currentOwner && currentOwner.email) ? currentOwner.email : '');
    const res = await API.get(`/properties/owner/${ownerId}?ownerEmail=${ownerEmail}`);

    if (!res.success || !res.data || res.data.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-building-add fs-1 text-muted d-block mb-2"></i>
                <h5 class="fw-bold">No properties listed yet</h5>
                <p class="text-muted">Start reaching tenants today by listing your PG or hostel.</p>
                <button class="btn btn-primary fw-semibold" onclick="openAddPropertyModal()">
                    Add Your First Property
                </button>
            </div>
        `;
        return;
    }

    const properties = [...res.data].reverse();
    container.innerHTML = properties.map(p => {
        const roomsCount = p.rooms ? p.rooms.length : 0;
        const availableBeds = p.totalAvailableRooms || 0;
        const img = p.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';

        return `
            <div class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                    <div class="row g-0 h-100">
                        <div class="col-md-5">
                            <img src="${img}" class="img-fluid h-100 w-100" style="object-fit: cover; min-height: 200px;" alt="${p.propertyName}">
                        </div>
                        <div class="col-md-7 p-3 d-flex flex-column justify-content-between">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="badge bg-light text-primary border">${p.city}</span>
                                    <span class="badge ${p.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary'}">${p.status}</span>
                                </div>
                                <h5 class="fw-bold mb-1">${p.propertyName}</h5>
                                <p class="text-muted small text-truncate mb-2">${p.address}</p>
                                <div class="small mb-2">
                                    <span class="fw-bold text-primary">₹${p.rent.toLocaleString()}/mo</span>
                                    <span class="text-muted ms-2">| ${roomsCount} Room Type(s)</span>
                                </div>
                                <span class="badge bg-info-subtle text-info"><i class="bi bi-door-open me-1"></i>${availableBeds} Available Beds</span>
                            </div>

                            <div class="mt-3 pt-2 border-top d-flex gap-2">
                                <button class="btn btn-sm btn-outline-primary flex-grow-1 fw-semibold" onclick="openAddRoomModal(${p.id})">
                                    <i class="bi bi-plus-lg me-1"></i>Add Room
                                </button>
                                <a href="property-details.html?id=${p.id}" class="btn btn-sm btn-light border px-3">
                                    View
                                </a>
                                <button class="btn btn-sm btn-outline-danger px-3" title="Delete this listing" onclick="openDeleteOwnerModal(${p.id}, '${(p.propertyName || '').replace(/'/g, "\\'")}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openDeleteOwnerModal(id, name) {
    pendingOwnerDeleteId = id;
    const modalEl = document.getElementById('deleteOwnerPropertyModal');
    const textEl = document.getElementById('deleteOwnerModalText');
    if (textEl) {
        textEl.innerHTML = `Kya aap sach me <strong>"${name || ('Property #' + id)}"</strong> ko delete karna chahti hain?`;
    }
    if (modalEl && typeof bootstrap !== 'undefined') {
        if (!deleteOwnerModalInstance) {
            deleteOwnerModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        }
        deleteOwnerModalInstance.show();
    } else {
        if (confirm(`Kya aap sach me "${name || ('Property #' + id)}" ko delete karna chahti hain?`)) {
            executeDeleteOwnerProperty();
        }
    }
}

async function executeDeleteOwnerProperty() {
    if (!pendingOwnerDeleteId) return;
    const id = pendingOwnerDeleteId;
    const btn = document.getElementById('btn-confirm-owner-delete');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Deleting...';
    }

    try {
        const res = await API.delete(`/properties/${id}`);
        if (res.success) {
            if (deleteOwnerModalInstance) deleteOwnerModalInstance.hide();
            showAlert('PG listing successfully delete ho gayi!', 'success');
            await loadOwnerProperties();
            await loadIncomingRequests();
        } else {
            showAlert(res.message || 'Delete karne me error aaya.', 'danger');
        }
    } catch (err) {
        showAlert('Delete karne me error aaya: ' + (err.message || err), 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-trash me-1"></i>Haan, Delete Karein';
        }
        pendingOwnerDeleteId = null;
    }
}

function deleteOwnerProperty(id, name) {
    openDeleteOwnerModal(id, name);
}

window.openDeleteOwnerModal = openDeleteOwnerModal;
window.deleteOwnerProperty = deleteOwnerProperty;

function openAddRoomModal(propertyId) {
    document.getElementById('room-prop-id').value = propertyId;
    const roomModalEl = document.getElementById('addRoomModal');
    if (roomModalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(roomModalEl).show();
    }
}
window.openAddRoomModal = openAddRoomModal;

function setupForms() {
    // Add Property Form
    const propForm = document.getElementById('add-property-form');
    if (propForm) {
        propForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amenitiesStr = document.getElementById('prop-amenities').value;
            const amenitiesList = amenitiesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const payload = {
                propertyName: document.getElementById('prop-name').value.trim(),
                genderType: document.getElementById('prop-gender').value,
                address: document.getElementById('prop-address').value.trim(),
                city: document.getElementById('prop-city').value.trim(),
                state: document.getElementById('prop-state') ? document.getElementById('prop-state').value.trim() : 'Uttar Pradesh',
                pincode: document.getElementById('prop-pincode').value.trim(),
                rent: parseFloat(document.getElementById('prop-rent').value),
                deposit: parseFloat(document.getElementById('prop-deposit').value || 0),
                contactPhone: document.getElementById('prop-phone').value.trim(),
                contactEmail: document.getElementById('prop-email').value.trim(),
                imageUrl: document.getElementById('prop-image').value.trim() || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
                description: document.getElementById('prop-desc').value.trim(),
                rules: document.getElementById('prop-rules').value.trim(),
                amenities: amenitiesList
            };

            const btn = document.getElementById('btn-save-prop');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Publishing...';
            }

            try {
                const ownerId = (currentOwner && currentOwner.id) ? currentOwner.id : 2;
                const ownerEmail = encodeURIComponent((currentOwner && currentOwner.email) ? currentOwner.email : '');
                const res = await API.post(`/properties?ownerId=${ownerId}&ownerEmail=${ownerEmail}`, payload);

                if (res.success) {
                    hideAddPropertyModal();
                    propForm.reset();
                    showAlert('Property listing successfully create ho gayi!', 'success');
                    await loadOwnerProperties();
                    // Switch to "My Listed Properties" tab so user immediately sees their new PG
                    const propsTabBtn = document.getElementById('properties-tab');
                    if (propsTabBtn && typeof bootstrap !== 'undefined') {
                        bootstrap.Tab.getOrCreateInstance(propsTabBtn).show();
                    }
                } else {
                    showAlert(res.message || 'Property list karne me error aaya.', 'danger');
                }
            } catch (err) {
                showAlert('Error: ' + (err.message || err), 'danger');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Publish PG Listing';
                }
            }
        });
    }

    // Add Room Form
    const roomForm = document.getElementById('add-room-form');
    if (roomForm) {
        roomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const propId = document.getElementById('room-prop-id').value;

            const payload = {
                roomType: document.getElementById('room-type').value,
                roomNumber: document.getElementById('room-number').value.trim(),
                rent: parseFloat(document.getElementById('room-rent').value),
                availableRooms: parseInt(document.getElementById('room-available').value),
                capacity: parseInt(document.getElementById('room-available').value),
                acAvailable: document.getElementById('room-ac').checked
            };

            const btn = document.getElementById('btn-save-room');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';
            }

            try {
                const res = await API.post(`/rooms/property/${propId}`, payload);
                if (res.success) {
                    const roomModalEl = document.getElementById('addRoomModal');
                    if (roomModalEl && typeof bootstrap !== 'undefined') {
                        bootstrap.Modal.getOrCreateInstance(roomModalEl).hide();
                    }
                    setTimeout(() => {
                        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.removeProperty('padding-right');
                        document.body.style.removeProperty('overflow');
                    }, 300);
                    roomForm.reset();
                    showAlert('Room added to property!', 'success');
                    await loadOwnerProperties();
                } else {
                    showAlert(res.message || 'Failed to add room.', 'danger');
                }
            } catch (err) {
                showAlert('Error: ' + (err.message || err), 'danger');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Save Room';
                }
            }
        });
    }
}

function formatRoomType(type) {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
