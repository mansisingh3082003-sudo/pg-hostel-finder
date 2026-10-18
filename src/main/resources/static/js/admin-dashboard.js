// ===================================================================
// PG & HOSTEL FINDER - ADMIN DASHBOARD LOGIC
// ===================================================================

let currentAdmin = null;
let allAdminProperties = [];
let allAdminUsers = [];
let allAdminBookings = [];
let currentSelectedRole = 'ALL';

let pendingDeleteId = null;
let deleteModalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    currentAdmin = Auth.requireAuth(['ADMIN']);
    if (!currentAdmin) return;

    loadAdminStats();
    loadAdminProperties();
    loadAdminUsers();
    loadAdminBookings();

    const confirmBtn = document.getElementById('btn-confirm-delete');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', executeDeleteProperty);
    }
});

// Update Top Metric Stat Counts
async function loadAdminStats() {
    try {
        const res = await API.get('/admin/stats');
        if (res.success && res.data) {
            const s = res.data;
            document.getElementById('stat-students').textContent = s.totalStudents || 0;
            document.getElementById('stat-owners').textContent = s.totalOwners || 0;
            document.getElementById('stat-properties').textContent = s.activeProperties || 0;
            document.getElementById('stat-bookings').textContent = s.totalBookings || 0;
        }
    } catch (e) {
        console.error('Error loading admin stats:', e);
    }
}

// -------------------------------------------------------------------
// TAB SWITCHING & STAT CARD CLICK HANDLERS
// -------------------------------------------------------------------
function showTab(tabId) {
    let btnId = 'tab-listings-btn';
    if (tabId === 'tab-users') btnId = 'tab-users-btn';
    if (tabId === 'tab-bookings') btnId = 'tab-bookings-btn';

    const btnEl = document.getElementById(btnId);
    if (btnEl && typeof bootstrap !== 'undefined') {
        bootstrap.Tab.getOrCreateInstance(btnEl).show();
    }

    updateActiveStatCard(tabId);

    // Scroll smoothly to the tab area
    setTimeout(() => {
        const target = document.getElementById(tabId) || document.getElementById('adminTabs');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
}

function updateActiveStatCard(target) {
    const cardStudents = document.getElementById('card-stat-students');
    const cardOwners = document.getElementById('card-stat-owners');
    const cardListings = document.getElementById('card-stat-listings');
    const cardBookings = document.getElementById('card-stat-bookings');

    [cardStudents, cardOwners, cardListings, cardBookings].forEach(c => {
        if (c) {
            c.classList.remove('active-student', 'active-owner', 'active-listing', 'active-booking');
        }
    });

    if (target === 'tab-listings') {
        if (cardListings) cardListings.classList.add('active-listing');
    } else if (target === 'tab-bookings') {
        if (cardBookings) cardBookings.classList.add('active-booking');
    } else if (target === 'student' && cardStudents) {
        cardStudents.classList.add('active-student');
    } else if (target === 'owner' && cardOwners) {
        cardOwners.classList.add('active-owner');
    } else if (target === 'tab-users') {
        if (currentSelectedRole === 'USER' && cardStudents) {
            cardStudents.classList.add('active-student');
        } else if (currentSelectedRole === 'OWNER' && cardOwners) {
            cardOwners.classList.add('active-owner');
        } else if (cardStudents) {
            cardStudents.classList.add('active-student');
        }
    }
}

// -------------------------------------------------------------------
// TAB 1: PROPERTIES LISTINGS LOGIC
// -------------------------------------------------------------------
async function loadAdminProperties() {
    const tbody = document.getElementById('admin-properties-table-body');
    const res = await API.get('/properties/all');

    if (!res.success || !res.data || res.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No properties found.</td></tr>`;
        return;
    }

    allAdminProperties = res.data;
    renderPropertiesTable(allAdminProperties);
}

function filterPropertiesTable() {
    const query = (document.getElementById('listing-search-input')?.value || '').toLowerCase().trim();
    if (!query) {
        renderPropertiesTable(allAdminProperties);
        return;
    }
    const filtered = allAdminProperties.filter(p => {
        const name = (p.propertyName || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const owner = (p.owner && p.owner.name ? p.owner.name : '').toLowerCase();
        return name.includes(query) || city.includes(query) || owner.includes(query);
    });
    renderPropertiesTable(filtered);
}

function renderPropertiesTable(properties) {
    const tbody = document.getElementById('admin-properties-table-body');
    if (!tbody) return;

    if (!properties || properties.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No properties match your search.</td></tr>`;
        return;
    }

    tbody.innerHTML = properties.map(p => {
        const ownerName = p.owner ? p.owner.name : 'Unknown';
        const isVerified = p.verified === true;
        const isActive = p.status === 'Active';

        return `
            <tr>
                <td class="fw-bold">#${p.id}</td>
                <td>
                    <a href="property-details.html?id=${p.id}" class="fw-bold text-decoration-none text-dark">${p.propertyName}</a>
                </td>
                <td>${p.city}</td>
                <td>${ownerName}</td>
                <td>₹${(p.rent || 0).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm ${isVerified ? 'btn-success' : 'btn-outline-secondary'}" onclick="togglePropertyVerification(${p.id})">
                        <i class="bi ${isVerified ? 'bi-patch-check-fill' : 'bi-x-circle'} me-1"></i>${isVerified ? 'Verified' : 'Unverified'}
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm ${isActive ? 'btn-outline-success' : 'btn-outline-danger'}" onclick="togglePropertyStatus(${p.id})">
                        ${p.status}
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" title="Delete Property" onclick="openDeleteModal(${p.id}, '${(p.propertyName || '').replace(/'/g, "\\'")}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function togglePropertyVerification(id) {
    const res = await API.patch(`/properties/${id}/verify`);
    if (res.success) {
        showAlert('Verification status updated!', 'success');
        loadAdminProperties();
    } else {
        showAlert(res.message || 'Operation failed.', 'danger');
    }
}

async function togglePropertyStatus(id) {
    const res = await API.patch(`/properties/${id}/status`);
    if (res.success) {
        showAlert('Property status updated!', 'success');
        loadAdminProperties();
        loadAdminStats();
    } else {
        showAlert(res.message || 'Operation failed.', 'danger');
    }
}

function openDeleteModal(id, name) {
    pendingDeleteId = id;
    const modalEl = document.getElementById('deletePropertyModal');
    const textEl = document.getElementById('deleteModalPropertyText');
    if (textEl) {
        textEl.innerHTML = `Are you sure you want to permanently delete <strong>"${name || ('Property #' + id)}"</strong>?`;
    }
    if (modalEl && typeof bootstrap !== 'undefined') {
        if (!deleteModalInstance) {
            deleteModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        }
        deleteModalInstance.show();
    } else {
        if (confirm(`Are you sure you want to permanently delete ${name || ('Property #' + id)}?`)) {
            executeDeleteProperty();
        }
    }
}

async function executeDeleteProperty() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    const btn = document.getElementById('btn-confirm-delete');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Deleting...';
    }

    try {
        const res = await API.delete(`/properties/${id}`);
        if (res.success) {
            if (deleteModalInstance) deleteModalInstance.hide();
            showAlert('Property listing successfully deleted!', 'success');
            await loadAdminProperties();
            await loadAdminStats();
        } else {
            showAlert(res.message || 'Failed to delete property.', 'danger');
        }
    } catch (err) {
        showAlert('Failed to delete property: ' + (err.message || err), 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-trash me-1"></i>Yes, Delete';
        }
        pendingDeleteId = null;
    }
}

// -------------------------------------------------------------------
// TAB 2: USERS & ROLES LOGIC (WITH QUICK FILTERS)
// -------------------------------------------------------------------
async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-table-body');
    const res = await API.get('/admin/users');

    if (!res.success || !res.data || res.data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No users found.</td></tr>`;
        return;
    }

    allAdminUsers = res.data;
    applyUserFilters();
}

function filterAndShowUsers(role = 'ALL') {
    currentSelectedRole = role;
    showTab('tab-users');

    // Update active highlight on stat cards
    if (role === 'USER') updateActiveStatCard('student');
    else if (role === 'OWNER') updateActiveStatCard('owner');
    else updateActiveStatCard('tab-users');

    // Update role filter buttons
    const btnAll = document.getElementById('filter-user-all');
    const btnStudents = document.getElementById('filter-user-students');
    const btnOwners = document.getElementById('filter-user-owners');
    const btnAdmins = document.getElementById('filter-user-admins');

    [btnAll, btnStudents, btnOwners, btnAdmins].forEach(b => {
        if (b) b.classList.remove('active');
    });

    if (role === 'USER' && btnStudents) btnStudents.classList.add('active');
    else if (role === 'OWNER' && btnOwners) btnOwners.classList.add('active');
    else if (role === 'ADMIN' && btnAdmins) btnAdmins.classList.add('active');
    else if (btnAll) btnAll.classList.add('active');

    // Update header label
    const labelEl = document.getElementById('users-filter-label');
    if (labelEl) {
        if (role === 'USER') labelEl.innerHTML = '<span class="badge bg-primary">Showing Students Only</span>';
        else if (role === 'OWNER') labelEl.innerHTML = '<span class="badge bg-warning text-dark">Showing Property Owners Only</span>';
        else if (role === 'ADMIN') labelEl.innerHTML = '<span class="badge bg-danger">Showing Administrators Only</span>';
        else labelEl.textContent = 'Showing all platform users';
    }

    applyUserFilters();
}

function applyUserFilters() {
    const query = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();

    let filtered = allAdminUsers;
    if (currentSelectedRole !== 'ALL') {
        filtered = filtered.filter(u => u.role === currentSelectedRole);
    }

    if (query) {
        filtered = filtered.filter(u => {
            const name = (u.name || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            const phone = (u.phone || '').toLowerCase();
            return name.includes(query) || email.includes(query) || phone.includes(query);
        });
    }

    renderUsersTable(filtered);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No users found matching current filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        let badgeClass = 'bg-primary';
        if (u.role === 'OWNER') badgeClass = 'bg-warning text-dark';
        if (u.role === 'ADMIN') badgeClass = 'bg-danger';

        const createdDate = u.createdAt ? u.createdAt.substring(0, 10) : 'Pre-seeded';

        return `
            <tr>
                <td class="fw-bold">#USR-${u.id}</td>
                <td>
                    <div class="fw-bold text-dark">${u.name}</div>
                </td>
                <td>${u.email}</td>
                <td>${u.phone || 'N/A'}</td>
                <td><span class="badge ${badgeClass}">${u.role}</span></td>
                <td>${createdDate}</td>
            </tr>
        `;
    }).join('');
}

// -------------------------------------------------------------------
// TAB 3: PLATFORM BOOKINGS LOGIC
// -------------------------------------------------------------------
async function loadAdminBookings() {
    const tbody = document.getElementById('admin-bookings-table-body');
    const countLabel = document.getElementById('bookings-count-label');
    if (!tbody) return;

    try {
        const res = await API.get('/bookings/all');
        if (res.success && res.data && res.data.length > 0) {
            allAdminBookings = res.data;
            if (countLabel) countLabel.textContent = `${allAdminBookings.length} Total Bookings Received`;
            renderBookingsTable(allAdminBookings);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-inbox fs-3 d-block mb-1 text-secondary"></i>
                        No booking requests recorded on the platform yet.
                    </td>
                </tr>
            `;
            if (countLabel) countLabel.textContent = '0 Bookings';
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error loading bookings: ${e.message || e}</td></tr>`;
    }
}

function filterBookingsTable() {
    const query = (document.getElementById('booking-search-input')?.value || '').toLowerCase().trim();
    if (!query) {
        renderBookingsTable(allAdminBookings);
        return;
    }

    const filtered = allAdminBookings.filter(b => {
        const student = (b.user && b.user.name ? b.user.name : '').toLowerCase();
        const prop = (b.property && b.property.propertyName ? b.property.propertyName : '').toLowerCase();
        const city = (b.property && b.property.city ? b.property.city : '').toLowerCase();
        const status = (b.status || '').toLowerCase();
        return student.includes(query) || prop.includes(query) || city.includes(query) || status.includes(query);
    });

    renderBookingsTable(filtered);
}

function renderBookingsTable(bookings) {
    const tbody = document.getElementById('admin-bookings-table-body');
    if (!tbody) return;

    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No bookings match your search.</td></tr>`;
        return;
    }

    tbody.innerHTML = bookings.map(b => {
        const studentName = b.user ? b.user.name : 'Unknown';
        const studentPhone = b.user && b.user.phone ? b.user.phone : 'N/A';
        const propName = b.property ? b.property.propertyName : 'N/A';
        const propCity = b.property ? b.property.city : '';
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
                <td>
                    <div class="fw-semibold text-dark">${propName}</div>
                    <div class="small text-muted"><i class="bi bi-geo-alt me-1"></i>${propCity}</div>
                </td>
                <td>${roomType} ${roomNum}</td>
                <td>${b.checkInDate || 'N/A'}</td>
                <td>${b.durationMonths || 1} mo</td>
                <td>
                    <span class="status-badge status-${b.status || 'PENDING'}">${b.status || 'PENDING'}</span>
                    ${payBadge}
                </td>
                <td><small class="text-muted">${b.remarks || 'None'}</small></td>
            </tr>
        `;
    }).join('');
}

function formatRoomType(type) {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Global window bindings
window.showTab = showTab;
window.filterAndShowUsers = filterAndShowUsers;
window.applyUserFilters = applyUserFilters;
window.filterPropertiesTable = filterPropertiesTable;
window.filterBookingsTable = filterBookingsTable;
window.openDeleteModal = openDeleteModal;
window.deleteProperty = openDeleteModal;
window.togglePropertyVerification = togglePropertyVerification;
window.togglePropertyStatus = togglePropertyStatus;
window.updateActiveStatCard = updateActiveStatCard;
