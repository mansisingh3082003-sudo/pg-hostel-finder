// ===================================================================
// PG & HOSTEL FINDER - STUDENT DASHBOARD & PAYMENT GATEWAY LOGIC
// ===================================================================

let currentUser = null;
let userBookingsList = [];
let activePaymentBooking = null;
let currentPayAmount = 1000;
let currentPayMethod = 'UPI (Google Pay)';
let qrTimerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = Auth.requireAuth(['USER', 'ADMIN', 'OWNER']);
    if (!currentUser) return;

    const nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.textContent = currentUser.name || 'Student';

    const emailEl = document.getElementById('user-display-email');
    if (emailEl) emailEl.textContent = currentUser.email || 'student@example.com';

    loadUserBookings();
});

async function loadUserBookings() {
    const tableBody = document.getElementById('bookings-table-body');
    const countDisplay = document.getElementById('bookings-count');

    try {
        const res = await API.get(`/bookings/user/${currentUser.id}`);
        if (!res.success || !res.data || res.data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5 text-muted">
                        <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
                        You have not made any booking requests yet.
                        <div class="mt-2">
                            <a href="search.html" class="btn btn-sm btn-primary">Find a PG Now</a>
                        </div>
                    </td>
                </tr>
            `;
            if (countDisplay) countDisplay.textContent = '0 Bookings';
            return;
        }

        userBookingsList = res.data;
        if (countDisplay) countDisplay.textContent = `${userBookingsList.length} Bookings Total`;

        tableBody.innerHTML = userBookingsList.map(b => {
            const propName = b.property ? b.property.propertyName : 'Accommodation';
            const propId = b.property ? b.property.id : '#';
            const roomType = b.room ? formatRoomType(b.room.roomType) : 'Standard';
            const roomNum = b.room && b.room.roomNumber ? `(${b.room.roomNumber})` : '';
            const statusBadgeClass = `status-${b.status}`;
            const isPaid = b.paymentStatus === 'PAID';
            const rentAmount = (b.room && b.room.rent) ? b.room.rent : (b.property && b.property.rent ? b.property.rent : 6000);

            return `
                <tr>
                    <td class="fw-bold text-muted">#BK-${b.id}</td>
                    <td>
                        <a href="property-details.html?id=${propId}" class="fw-bold text-decoration-none text-dark">
                            ${propName}
                        </a>
                        <div class="small text-muted"><i class="bi bi-geo-alt me-1"></i>${b.property ? b.property.city : ''}</div>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border">${roomType} ${roomNum}</span>
                        <div class="small text-primary fw-semibold mt-1">₹${rentAmount.toLocaleString()}/mo</div>
                    </td>
                    <td>${b.checkInDate || 'N/A'}</td>
                    <td>${b.durationMonths || 1} Month(s)</td>
                    <td>
                        <span class="status-badge ${statusBadgeClass}">
                            ${b.status}
                        </span>
                        ${b.status === 'PENDING' ? `
                            <div class="text-muted mt-1" style="font-size: 0.72rem;">
                                <i class="bi bi-hourglass-split me-1 text-warning"></i>Awaiting Approval
                            </div>
                        ` : ''}
                    </td>
                    <td>
                        ${isPaid ? `
                            <span class="badge bg-success-subtle text-success border border-success-subtle py-1 px-2">
                                <i class="bi bi-check-circle-fill me-1"></i>PAID (₹${(b.amountPaid || rentAmount).toLocaleString()})
                            </span>
                            <div class="text-muted small mt-1" style="font-size: 0.7rem;">
                                ${b.paymentMethod || 'Online'}
                            </div>
                        ` : (b.status === 'APPROVED' ? `
                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1 px-2">
                                <i class="bi bi-exclamation-circle-fill me-1"></i>Payment Due
                            </span>
                        ` : `
                            <span class="text-muted small">-</span>
                        `)}
                    </td>
                    <td>
                        ${b.status === 'PENDING' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking(${b.id})">
                                <i class="bi bi-x-circle me-1"></i>Cancel
                            </button>
                        ` : (b.status === 'APPROVED' ? `
                            ${!isPaid ? `
                                <button class="btn btn-sm btn-success fw-bold text-nowrap" onclick="openPaymentModal(${b.id})">
                                    <i class="bi bi-credit-card-2-front me-1"></i>Pay Rent / Token
                                </button>
                            ` : `
                                <div class="d-flex gap-1">
                                    <button class="btn btn-sm btn-primary fw-semibold" onclick="openReceiptModal(${b.id})">
                                        <i class="bi bi-receipt me-1"></i>Receipt
                                    </button>
                                    <a href="property-details.html?id=${propId}#reviews-section" class="btn btn-sm btn-outline-secondary" title="Write a review">
                                        <i class="bi bi-star"></i>
                                    </a>
                                </div>
                            `}
                        ` : `
                            <span class="text-muted small">-</span>
                        `)}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (e) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error loading bookings: ${e.message || e}</td></tr>`;
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;

    const res = await API.patch(`/bookings/${bookingId}/status?status=CANCELLED&remarks=Cancelled by user`);
    if (res.success) {
        showAlert('Booking request cancelled.', 'info');
        loadUserBookings();
    } else {
        showAlert(res.message || 'Failed to cancel booking.', 'danger');
    }
}

// -------------------------------------------------------------------
// ONLINE PAYMENT GATEWAY CHECKOUT MODAL
// -------------------------------------------------------------------
function openPaymentModal(bookingId) {
    const booking = userBookingsList.find(b => b.id === bookingId);
    if (!booking) {
        showAlert('Booking record not found.', 'danger');
        return;
    }

    activePaymentBooking = booking;

    const propName = booking.property ? booking.property.propertyName : 'Hostel Accommodation';
    const rentAmount = (booking.room && booking.room.rent) ? booking.room.rent : (booking.property && booking.property.rent ? booking.property.rent : 6000);

    document.getElementById('pay-modal-prop-name').textContent = `${propName} • Booking #BK-${booking.id}`;
    document.getElementById('pay-full-rent-amount').textContent = `₹${rentAmount.toLocaleString()}`;

    // Default to Token amount (₹1,000)
    setPaymentAmountType('TOKEN');

    // Reset payment method tabs
    selectPaymentMethod('UPI');

    // Start QR Countdown timer (5 minutes)
    startQrCountdown();

    const modalEl = document.getElementById('paymentModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
}

function setPaymentAmountType(type) {
    if (!activePaymentBooking) return;
    const rentAmount = (activePaymentBooking.room && activePaymentBooking.room.rent) 
        ? activePaymentBooking.room.rent 
        : (activePaymentBooking.property && activePaymentBooking.property.rent ? activePaymentBooking.property.rent : 6000);

    if (type === 'FULL') {
        currentPayAmount = rentAmount;
        document.getElementById('payChoiceFull').checked = true;
    } else {
        currentPayAmount = 1000;
        document.getElementById('payChoiceToken').checked = true;
    }

    document.getElementById('pay-modal-amount-badge').textContent = `₹${currentPayAmount.toLocaleString()}`;
    document.getElementById('pay-btn-amount-display').textContent = `₹${currentPayAmount.toLocaleString()}`;
}

function selectPaymentMethod(method) {
    const btnUpi = document.getElementById('btn-method-upi');
    const btnCard = document.getElementById('btn-method-card');
    const btnNetbanking = document.getElementById('btn-method-netbanking');

    const secUpi = document.getElementById('section-pay-upi');
    const secCard = document.getElementById('section-pay-card');
    const secNetbanking = document.getElementById('section-pay-netbanking');

    [btnUpi, btnCard, btnNetbanking].forEach(b => b?.classList.remove('active'));
    [secUpi, secCard, secNetbanking].forEach(s => { if (s) s.style.display = 'none'; });

    if (method === 'UPI') {
        btnUpi?.classList.add('active');
        if (secUpi) secUpi.style.display = 'block';
        currentPayMethod = 'UPI (Google Pay)';
    } else if (method === 'CARD') {
        btnCard?.classList.add('active');
        if (secCard) secCard.style.display = 'block';
        currentPayMethod = 'Credit / Debit Card';
    } else if (method === 'NETBANKING') {
        btnNetbanking?.classList.add('active');
        if (secNetbanking) secNetbanking.style.display = 'block';
        currentPayMethod = 'Net Banking (SBI)';
    }
}

function selectUpiApp(element, appName) {
    document.querySelectorAll('.upi-app-chip').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    currentPayMethod = `UPI (${appName})`;
}

function startQrCountdown() {
    clearInterval(qrTimerInterval);
    let secondsLeft = 299;
    const timerEl = document.getElementById('qr-timer');

    qrTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(qrTimerInterval);
            if (timerEl) timerEl.textContent = 'Expired';
            return;
        }
        const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
        const s = (secondsLeft % 60).toString().padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);
}

async function processPayment() {
    if (!activePaymentBooking) return;
    const btn = document.getElementById('btn-submit-payment');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing Payment...';
    }

    const bookingId = activePaymentBooking.id;
    const txnId = 'TXN_' + Date.now();

    try {
        // Call backend /pay endpoint
        const res = await API.post(`/bookings/${bookingId}/pay?amount=${currentPayAmount}&method=${encodeURIComponent(currentPayMethod)}&transactionId=${txnId}`, {
            amount: currentPayAmount,
            method: currentPayMethod,
            transactionId: txnId
        });

        // Close payment modal
        const payModalEl = document.getElementById('paymentModal');
        if (payModalEl && typeof bootstrap !== 'undefined') {
            bootstrap.Modal.getOrCreateInstance(payModalEl).hide();
        }
        clearInterval(qrTimerInterval);

        // Show congratulations alert
        showAlert(`Payment of ₹${currentPayAmount.toLocaleString()} successfully received via ${currentPayMethod}! Reference: ${txnId}`, 'success');

        // Reload bookings to reflect PAID status
        await loadUserBookings();

        // Automatically open the Official Printable Receipt
        setTimeout(() => {
            openReceiptModal(bookingId);
        }, 600);

    } catch (err) {
        showAlert('Payment failed: ' + (err.message || err), 'danger');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-lock-fill me-1"></i> Pay ₹${currentPayAmount.toLocaleString()} Securely`;
        }
    }
}

// -------------------------------------------------------------------
// OFFICIAL PRINTABLE INVOICE / RECEIPT VOUCHER
// -------------------------------------------------------------------
function openReceiptModal(bookingId) {
    const booking = userBookingsList.find(b => b.id === bookingId);
    if (!booking) return;

    const prop = booking.property || {};
    const room = booking.room || {};
    const amount = booking.amountPaid || (currentPayAmount || 1000);
    const txnId = booking.transactionId || ('TXN_' + Date.now());
    const method = booking.paymentMethod || 'UPI (Google Pay)';
    const roomType = room.roomType ? formatRoomType(room.roomType) : 'Standard';
    const roomNum = room.roomNumber ? `(Room ${room.roomNumber})` : '';

    // Populate Receipt Modal elements
    document.getElementById('rcpt-inv-num').textContent = `#INV-2026-${booking.id.toString().padStart(4, '0')}`;
    document.getElementById('rcpt-date-time').textContent = `Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    
    document.getElementById('rcpt-student-name').textContent = currentUser.name || 'Student';
    document.getElementById('rcpt-student-email').innerHTML = `<i class="bi bi-envelope me-1"></i>${currentUser.email || 'student@example.com'}`;
    document.getElementById('rcpt-student-phone').innerHTML = `<i class="bi bi-telephone me-1"></i>${currentUser.phone || '9876543210'}`;

    document.getElementById('rcpt-prop-name').textContent = prop.propertyName || 'PG Accommodation';
    document.getElementById('rcpt-prop-address').innerHTML = `<i class="bi bi-geo-alt me-1"></i>${prop.address || 'Address provided on portal'}`;
    document.getElementById('rcpt-prop-city').innerHTML = `<i class="bi bi-building me-1"></i>${prop.city || 'Greater Noida'}, ${prop.state || 'Uttar Pradesh'} - ${prop.pincode || '201308'}`;

    document.getElementById('rcpt-booking-id').textContent = `Booking ID: #BK-${booking.id}`;
    document.getElementById('rcpt-item-desc').textContent = (amount <= 2000) ? 'Advance Token Booking Fee (Guaranteed Bed Reservation)' : '1st Month Rent & Security Deposit';
    document.getElementById('rcpt-room-info').textContent = `${roomType} ${roomNum}`;
    document.getElementById('rcpt-checkin').textContent = booking.checkInDate || 'Arrival Day';
    document.getElementById('rcpt-duration').textContent = `${booking.durationMonths || 1} Month(s)`;
    document.getElementById('rcpt-amount-table').textContent = `₹${amount.toLocaleString()}`;
    document.getElementById('rcpt-grand-total').textContent = `₹${amount.toLocaleString()}`;

    document.getElementById('rcpt-txn-id').textContent = txnId;
    document.getElementById('rcpt-pay-method').textContent = method;

    const receiptModalEl = document.getElementById('receiptModal');
    if (receiptModalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(receiptModalEl).show();
    }
}

function printReceipt() {
    window.print();
}

function formatRoomType(type) {
    if (!type) return '';
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Global window bindings
window.openPaymentModal = openPaymentModal;
window.setPaymentAmountType = setPaymentAmountType;
window.selectPaymentMethod = selectPaymentMethod;
window.selectUpiApp = selectUpiApp;
window.processPayment = processPayment;
window.openReceiptModal = openReceiptModal;
window.printReceipt = printReceipt;
window.cancelBooking = cancelBooking;
