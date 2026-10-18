// ===================================================================
// PG & HOSTEL FINDER - AUTH & SESSION MANAGER & NOTIFICATIONS
// ===================================================================

const Auth = {
    getUser() {
        const userStr = localStorage.getItem('pgh_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser(user) {
        localStorage.setItem('pgh_user', JSON.stringify(user));
        this.updateNav();
    },

    logout() {
        localStorage.removeItem('pgh_user');
        window.location.href = 'index.html';
    },

    isLoggedIn() {
        return this.getUser() !== null;
    },

    requireAuth(allowedRoles = []) {
        const user = this.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert('Access denied. Insufficient permissions.');
            window.location.href = 'index.html';
            return null;
        }
        return user;
    },

    getNotifications() {
        const user = this.getUser();
        if (!user) return [];

        const readKey = `pgh_read_notifs_${user.id || user.email}`;
        const readIds = JSON.parse(localStorage.getItem(readKey) || '[]');

        let list = [];
        if (user.role === 'OWNER') {
            list = [
                {
                    id: 'notif_own_1',
                    title: 'New Booking Request',
                    message: 'A student requested Room 101 at Puja Girls PG.',
                    time: 'Just now',
                    icon: 'bi-door-open-fill text-primary',
                    link: 'dashboard-owner.html'
                },
                {
                    id: 'notif_own_2',
                    title: 'Token Advance Credited',
                    message: '₹2,000 received via UPI for booking #101.',
                    time: '25m ago',
                    icon: 'bi-cash-coin text-success',
                    link: 'dashboard-owner.html'
                },
                {
                    id: 'notif_own_3',
                    title: 'New 5-Star Review',
                    message: 'A resident left a 5-star review on your listing.',
                    time: '2h ago',
                    icon: 'bi-star-fill text-warning',
                    link: 'dashboard-owner.html'
                }
            ];
        } else if (user.role === 'ADMIN') {
            list = [
                {
                    id: 'notif_adm_1',
                    title: 'Listing Verification',
                    message: 'New property "Puja Girls PG" submitted for audit.',
                    time: '5m ago',
                    icon: 'bi-shield-check text-info',
                    link: 'dashboard-admin.html'
                },
                {
                    id: 'notif_adm_2',
                    title: 'Platform Booking Active',
                    message: '10 active bookings confirmed across Bihar.',
                    time: '1h ago',
                    icon: 'bi-graph-up-arrow text-success',
                    link: 'dashboard-admin.html'
                },
                {
                    id: 'notif_adm_3',
                    title: 'Payment Gateway Live',
                    message: 'Razorpay UPI & Instant Invoicing online.',
                    time: '3h ago',
                    icon: 'bi-check-all text-primary',
                    link: 'dashboard-admin.html'
                }
            ];
        } else {
            // STUDENT / USER
            list = [
                {
                    id: 'notif_usr_1',
                    title: 'Booking Approved 🎉',
                    message: 'Your stay request has been approved by the owner!',
                    time: 'Just now',
                    icon: 'bi-check-circle-fill text-success',
                    link: 'dashboard-user.html'
                },
                {
                    id: 'notif_usr_2',
                    title: 'Invoice / Receipt Ready',
                    message: 'Token rent payment confirmed. Download Tax Invoice.',
                    time: '30m ago',
                    icon: 'bi-receipt text-primary',
                    link: 'dashboard-user.html'
                },
                {
                    id: 'notif_usr_3',
                    title: 'WhatsApp Owner Connected',
                    message: 'You can now chat directly with PG owners on WhatsApp.',
                    time: '2h ago',
                    icon: 'bi-whatsapp text-success',
                    link: 'search.html'
                }
            ];
        }

        return list.map(item => ({
            ...item,
            isRead: readIds.includes(item.id)
        }));
    },

    markAllNotificationsRead(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const user = this.getUser();
        if (!user) return;

        const notifs = this.getNotifications();
        const allIds = notifs.map(n => n.id);
        const readKey = `pgh_read_notifs_${user.id || user.email}`;
        localStorage.setItem(readKey, JSON.stringify(allIds));
        this.updateNav();
    },

    updateNav() {
        const user = this.getUser();
        const navAuth = document.getElementById('nav-auth-container');
        if (!navAuth) return;

        if (user) {
            let dashboardLink = 'dashboard-user.html';
            let roleBadge = 'badge bg-primary';

            if (user.role === 'OWNER') {
                dashboardLink = 'dashboard-owner.html';
                roleBadge = 'badge bg-warning text-dark';
            } else if (user.role === 'ADMIN') {
                dashboardLink = 'dashboard-admin.html';
                roleBadge = 'badge bg-danger';
            }

            const notifs = this.getNotifications();
            const unreadCount = notifs.filter(n => !n.isRead).length;

            const notifsHtml = notifs.map(n => `
                <a href="${n.link}" class="list-group-item list-group-item-action d-flex align-items-start gap-2 py-2 px-3 border-bottom ${n.isRead ? 'bg-white' : 'bg-light border-start border-3 border-primary'}">
                    <div class="fs-5 mt-1"><i class="bi ${n.icon}"></i></div>
                    <div class="flex-grow-1 min-w-0">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="small text-dark text-truncate">${n.title}</strong>
                            <span class="text-muted" style="font-size: 0.7rem;">${n.time}</span>
                        </div>
                        <p class="small text-muted mb-0 lh-sm" style="font-size: 0.78rem;">${n.message}</p>
                    </div>
                </a>
            `).join('');

            navAuth.innerHTML = `
                <!-- Notification Bell -->
                <div class="dropdown">
                    <button class="btn btn-light position-relative rounded-circle d-flex align-items-center justify-content-center p-0 border" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications" style="width: 38px; height: 38px;">
                        <i class="bi bi-bell-fill text-secondary fs-6"></i>
                        ${unreadCount > 0 ? `
                            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style="font-size: 0.65rem; padding: 0.25em 0.45em;">
                                ${unreadCount}
                            </span>
                        ` : ''}
                    </button>
                    <div class="dropdown-menu dropdown-menu-end shadow border-0 p-0" style="width: 320px; max-width: 90vw; border-radius: 12px; overflow: hidden;">
                        <div class="p-2 px-3 bg-primary text-white d-flex justify-content-between align-items-center">
                            <span class="fw-bold small"><i class="bi bi-bell me-1"></i> Notifications</span>
                            ${unreadCount > 0 ? `
                                <button type="button" class="btn btn-sm btn-link text-white text-decoration-none p-0" style="font-size: 0.75rem;" onclick="Auth.markAllNotificationsRead(event)">
                                    <i class="bi bi-check2-all me-1"></i>Mark read
                                </button>
                            ` : `<span class="badge bg-white text-primary" style="font-size: 0.7rem;">All Caught Up</span>`}
                        </div>
                        <div class="list-group list-group-flush" style="max-height: 280px; overflow-y: auto;">
                            ${notifsHtml}
                        </div>
                        <div class="p-2 bg-light text-center border-top">
                            <a href="${dashboardLink}" class="small text-decoration-none fw-semibold text-primary" style="font-size: 0.78rem;">View All Activity &rarr;</a>
                        </div>
                    </div>
                </div>

                <!-- User Profile Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-person-circle"></i>
                        <span>${user.name.split(' ')[0]}</span>
                        <span class="${roleBadge}">${user.role}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                        <li><a class="dropdown-item" href="${dashboardLink}"><i class="bi bi-speedometer2 me-2"></i>My Dashboard</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item text-danger" onclick="Auth.logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                    </ul>
                </div>
            `;
        } else {
            navAuth.innerHTML = `
                <a href="login.html" class="btn btn-outline-primary me-2">Login</a>
                <a href="register.html" class="btn btn-primary">Sign Up</a>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
});
