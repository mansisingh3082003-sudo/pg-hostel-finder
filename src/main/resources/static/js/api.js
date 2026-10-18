// ===================================================================
// PG & HOSTEL FINDER - RESILIENT API CLIENT (WITH SMART MOCK FALLBACK)
// Automatically connects to Spring Boot backend (/api) if running.
// If backend is offline, seamlessly falls back to LocalStorage Mock DB!
// ===================================================================

const API_BASE = '/api';

// Initialize LocalStorage Mock Database if not present
function initMockDb() {
    if (!localStorage.getItem('pgh_mock_v7')) {
        const mockUsers = [
            { id: 1, name: "System Administrator", email: "admin@pghfinder.com", phone: "9876543210", password: "admin123", role: "ADMIN", createdAt: "2026-09-01T10:00:00" },
            { id: 2, name: "Rajesh Sharma", email: "rajesh.owner@example.com", phone: "9811223344", password: "owner123", role: "OWNER", createdAt: "2026-09-02T10:00:00" },
            { id: 3, name: "Priya Kulkarni", email: "priya.owner@example.com", phone: "9822334455", password: "owner123", role: "OWNER", createdAt: "2026-09-05T10:00:00" },
            { id: 4, name: "Rahul Verma", email: "rahul.student@example.com", phone: "9933445566", password: "user123", role: "USER", createdAt: "2026-09-10T10:00:00" },
            { id: 5, name: "Sneha Patel", email: "sneha.student@example.com", phone: "9944556677", password: "user123", role: "USER", createdAt: "2026-09-12T10:00:00" },
            { id: 6, name: "Mansi Kumari", email: "monalsinghrajput1310@gmail.com", phone: "9876543210", password: "owner123", role: "OWNER", createdAt: "2026-09-15T10:00:00" },
            { id: 7, name: "Mansi Singh", email: "salonikumari1562001@gmail.com", phone: "9876543211", password: "user123", role: "USER", createdAt: "2026-09-18T10:00:00" }
        ];

        const mockProperties = [
            {
                id: 1,
                propertyName: "Green Valley Luxury PG for Men",
                address: "45, Neeladri Road, Electronic City Phase 1",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560100",
                rent: 7500.0,
                deposit: 12000.0,
                genderType: "BOYS",
                description: "Premium paying guest accommodation located in the heart of Electronic City. Ideal for tech professionals and students. 3 times hygienic home-style food, daily housekeeping, and 24/7 security.",
                rules: "Gate closes at 11:00 PM. No smoking or alcohol inside premises. Visitors allowed in lobby only.",
                contactPhone: "9811223344",
                contactEmail: "greenvalley@example.com",
                imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.8,
                totalAvailableRooms: 18,
                amenities: ["High-speed Wi-Fi", "3-Time Homestyle Food", "Daily Housekeeping", "CCTV Surveillance", "Power Backup", "Washing Machine"],
                owner: mockUsers[1],
                rooms: [
                    { id: 101, roomType: "SINGLE", roomNumber: "101", rent: 12000.0, capacity: 1, availableRooms: 3, acAvailable: true },
                    { id: 102, roomType: "DOUBLE", roomNumber: "102", rent: 7500.0, capacity: 2, availableRooms: 6, acAvailable: true },
                    { id: 103, roomType: "TRIPLE", roomNumber: "103", rent: 6000.0, capacity: 3, availableRooms: 9, acAvailable: false }
                ],
                reviews: [
                    { id: 1, rating: 5, comment: "Amazing food and super fast Wi-Fi! The owner Rajesh is very helpful.", reviewDate: "2026-09-25", user: { name: "Rahul Verma" } }
                ]
            },
            {
                id: 2,
                propertyName: "Sai Serene Living Ladies Hostel",
                address: "12, Clover Park, Viman Nagar near Symbiosis",
                city: "Pune",
                state: "Maharashtra",
                pincode: "411014",
                rent: 8000.0,
                deposit: 15000.0,
                genderType: "GIRLS",
                description: "Safe, modern, and vibrant hostel exclusively for female students and working professionals. Walking distance to Symbiosis colleges and Phoenix Marketcity. Biometric security and warden on premises.",
                rules: "Biometric entry by 10:30 PM. Overnight male visitors strictly prohibited. Silent hours after 11 PM.",
                contactPhone: "9822334455",
                contactEmail: "saiserene@example.com",
                imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.6,
                totalAvailableRooms: 16,
                amenities: ["High-speed Wi-Fi", "Biometric Access", "North & South Indian Meals", "Air Conditioning", "Refrigerator", "RO Water"],
                owner: mockUsers[2],
                rooms: [
                    { id: 201, roomType: "SINGLE", roomNumber: "201", rent: 14000.0, capacity: 1, availableRooms: 2, acAvailable: true },
                    { id: 202, roomType: "DOUBLE", roomNumber: "202", rent: 8000.0, capacity: 2, availableRooms: 8, acAvailable: true },
                    { id: 203, roomType: "TRIPLE", roomNumber: "203", rent: 6500.0, capacity: 3, availableRooms: 6, acAvailable: false }
                ],
                reviews: [
                    { id: 2, rating: 4, comment: "Very safe environment for girls, clean rooms and walking distance to college.", reviewDate: "2026-09-28", user: { name: "Sneha Patel" } }
                ]
            },
            {
                id: 3,
                propertyName: "Urban Nest Co-Living Spaces",
                address: "Plot 24, Sector 48, Sohna Road",
                city: "Delhi NCR",
                state: "Haryana",
                pincode: "122018",
                rent: 9500.0,
                deposit: 18000.0,
                genderType: "CO_ED",
                description: "Contemporary co-living space with recreation room, gym, dedicated workstations, and vibrant community events. Perfect for corporate employees and freelancers seeking hotel-like comfort.",
                rules: "24/7 entry permitted with smart card. Maintain cleanliness in common spaces.",
                contactPhone: "9811223344",
                contactEmail: "urbannest@example.com",
                imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.9,
                totalAvailableRooms: 14,
                amenities: ["High-speed Wi-Fi", "Coworking Space", "Gym & Games", "All-Meals Included", "Lift", "Power Backup"],
                owner: mockUsers[1],
                rooms: [
                    { id: 301, roomType: "SINGLE", roomNumber: "301", rent: 16000.0, capacity: 1, availableRooms: 4, acAvailable: true },
                    { id: 302, roomType: "DOUBLE", roomNumber: "302", rent: 9500.0, capacity: 2, availableRooms: 10, acAvailable: true }
                ],
                reviews: []
            },
            {
                id: 4,
                propertyName: "Cyber Towers Elite PG & Hostel",
                address: "Lane 3, Madhapur, near Hitec City Metro",
                city: "Hyderabad",
                state: "Telangana",
                pincode: "500081",
                rent: 6500.0,
                deposit: 10000.0,
                genderType: "CO_ED",
                description: "Affordable and convenient PG situated right next to the Madhapur metro station. Surrounded by major tech parks. Delicious South & North Indian buffets, spacious cupboards, and study tables.",
                rules: "Visitors allowed until 9:00 PM. Cleanliness in dining hall mandatory.",
                contactPhone: "9822334455",
                contactEmail: "cybertowers@example.com",
                imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.4,
                totalAvailableRooms: 17,
                amenities: ["High-speed Wi-Fi", "Buffet Breakfast & Dinner", "Attached Washrooms", "Laundry Facility", "CCTV"],
                owner: mockUsers[2],
                rooms: [
                    { id: 401, roomType: "DOUBLE", roomNumber: "401", rent: 7500.0, capacity: 2, availableRooms: 5, acAvailable: true },
                    { id: 402, roomType: "FOUR_SHARING", roomNumber: "402", rent: 5500.0, capacity: 4, availableRooms: 12, acAvailable: false }
                ],
                reviews: []
            },
            {
                id: 5,
                propertyName: "Magadh Royal Girls Hostel & PG",
                address: "Opp. A.N. College, Boring Road",
                city: "Patna",
                state: "Bihar",
                pincode: "800013",
                rent: 6500.0,
                deposit: 8000.0,
                genderType: "GIRLS",
                description: "Clean, peaceful, and highly secure hostel for girl students preparing for competitive exams or studying in Patna. 3 meals included, study library, and CCTV security.",
                rules: "Entry closes at 9:30 PM. Silence hours after 10 PM. No outside guests permitted in living rooms.",
                contactPhone: "9835012345",
                contactEmail: "magadhhostel@example.com",
                imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.7,
                totalAvailableRooms: 15,
                amenities: ["High-speed Wi-Fi", "3-Time Hygienic Food", "Study Table & Chair", "RO Drinking Water", "CCTV Security", "Power Backup"],
                owner: mockUsers[2],
                rooms: [
                    { id: 501, roomType: "SINGLE", roomNumber: "G-101", rent: 9000.0, capacity: 1, availableRooms: 3, acAvailable: true },
                    { id: 502, roomType: "DOUBLE", roomNumber: "G-102", rent: 6500.0, capacity: 2, availableRooms: 8, acAvailable: false },
                    { id: 503, roomType: "TRIPLE", roomNumber: "G-103", rent: 5000.0, capacity: 3, availableRooms: 4, acAvailable: false }
                ],
                reviews: [
                    { id: 3, rating: 5, comment: "Best food quality in Boring Road. Very quiet for self-study.", reviewDate: "2026-09-29", user: { name: "Sneha Patel" } }
                ]
            },
            {
                id: 6,
                propertyName: "Tirhut Executive Boys PG",
                address: "Near MIT Campus, Mithanpura",
                city: "Muzaffarpur",
                state: "Bihar",
                pincode: "842002",
                rent: 5500.0,
                deposit: 6000.0,
                genderType: "BOYS",
                description: "Spacious and affordable PG for engineering students and working professionals in Muzaffarpur. Walking distance to MIT and local coaching centers.",
                rules: "Gate closes at 10:00 PM. Keep premises neat and clean.",
                contactPhone: "9835123456",
                contactEmail: "tirhutpg@example.com",
                imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.5,
                totalAvailableRooms: 12,
                amenities: ["Wi-Fi", "Daily Breakfast & Dinner", "Bike Parking", "Inverter Backup", "Geyser"],
                owner: mockUsers[1],
                rooms: [
                    { id: 601, roomType: "SINGLE", roomNumber: "B-201", rent: 8000.0, capacity: 1, availableRooms: 2, acAvailable: true },
                    { id: 602, roomType: "DOUBLE", roomNumber: "B-202", rent: 5500.0, capacity: 2, availableRooms: 6, acAvailable: false },
                    { id: 603, roomType: "TRIPLE", roomNumber: "B-203", rent: 4200.0, capacity: 3, availableRooms: 4, acAvailable: false }
                ],
                reviews: []
            },
            {
                id: 7,
                propertyName: "Vaishali Green View PG & Hostel",
                address: "Cinema Road, Near Hajipur Railway Station",
                city: "Hajipur",
                state: "Bihar",
                pincode: "844101",
                rent: 4800.0,
                deposit: 5000.0,
                genderType: "CO_ED",
                description: "Modern PG situated adjacent to Hajipur Junction. Convenient commuting to Patna via Digha Bridge. Features home-cooked vegetarian food and 24/7 security.",
                rules: "Late night entry with prior intimation only. Strict discipline inside hostel.",
                contactPhone: "9835234567",
                contactEmail: "vaishalipg@example.com",
                imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.6,
                totalAvailableRooms: 10,
                amenities: ["High-speed Wi-Fi", "Homestyle Food", "RO Water", "Parking Space", "CCTV"],
                owner: mockUsers[2],
                rooms: [
                    { id: 701, roomType: "DOUBLE", roomNumber: "V-101", rent: 4800.0, capacity: 2, availableRooms: 6, acAvailable: false },
                    { id: 702, roomType: "TRIPLE", roomNumber: "V-102", rent: 3800.0, capacity: 3, availableRooms: 4, acAvailable: false }
                ],
                reviews: []
            },
            {
                id: 8,
                propertyName: "Puja Girls PG",
                address: "Beta 1, B-Block, Near Jagat Farm Market",
                city: "Greater Noida",
                state: "Uttar Pradesh",
                pincode: "201308",
                rent: 6000.0,
                deposit: 7000.0,
                genderType: "GIRLS",
                description: "Safe, peaceful, and fully-furnished Girls PG located in Beta 1, B-Block, right next to Jagat Farm Market. Ideal for female students and working professionals. Walking distance to markets, coaching, and metro. Includes 3-times hygienic home-cooked food, high-speed Wi-Fi, study table, and 24/7 CCTV security.",
                rules: "Gate closes at 9:30 PM. Silence hours after 10:00 PM. No outside male visitors permitted inside rooms.",
                contactPhone: "9876543210",
                contactEmail: "monalsinghrajput1310@gmail.com",
                imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.9,
                totalAvailableRooms: 15,
                amenities: ["High-speed Wi-Fi", "3-Time Homestyle Food", "RO Water", "CCTV Security", "Study Table & Chair", "Power Backup"],
                owner: mockUsers[5],
                rooms: [
                    { id: 801, roomType: "SINGLE", roomNumber: "P-101", rent: 8500.0, capacity: 1, availableRooms: 3, acAvailable: true },
                    { id: 802, roomType: "DOUBLE", roomNumber: "P-102", rent: 6000.0, capacity: 2, availableRooms: 6, acAvailable: false },
                    { id: 803, roomType: "TRIPLE", roomNumber: "P-103", rent: 4500.0, capacity: 3, availableRooms: 6, acAvailable: false }
                ],
                reviews: [
                    { id: 3, rating: 5, comment: "Bohot achha environment hai padhai ke liye, hygienic food and very safe!", reviewDate: "2026-10-01", user: { name: "Sneha Patel" } }
                ]
            },
            {
                id: 9,
                propertyName: "Knowledge Park Residency & PG",
                address: "Plot 12, Knowledge Park II, Near Pari Chowk Metro",
                city: "Greater Noida",
                state: "Uttar Pradesh",
                pincode: "201310",
                rent: 7000.0,
                deposit: 10000.0,
                genderType: "CO_ED",
                description: "Top-rated student accommodation in Knowledge Park II. Walking distance from major colleges, Galgotias, Sharda University, and Pari Chowk metro. 3 meals, power backup, and high-speed Wi-Fi included.",
                rules: "Entry allowed until 10:30 PM with smart card. Visitor access in common area only.",
                contactPhone: "9811223344",
                contactEmail: "knowledgeparkpg@example.com",
                imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
                verified: true,
                status: "Active",
                averageRating: 4.8,
                totalAvailableRooms: 18,
                amenities: ["High-speed Wi-Fi", "3-Time Hygienic Food", "Air Conditioning", "Power Backup", "Gym & Games", "CCTV Security", "Washing Machine"],
                owner: mockUsers[1],
                rooms: [
                    { id: 901, roomType: "SINGLE", roomNumber: "KP-101", rent: 11000.0, capacity: 1, availableRooms: 4, acAvailable: true },
                    { id: 902, roomType: "DOUBLE", roomNumber: "KP-102", rent: 7000.0, capacity: 2, availableRooms: 8, acAvailable: true },
                    { id: 903, roomType: "TRIPLE", roomNumber: "KP-103", rent: 5500.0, capacity: 3, availableRooms: 6, acAvailable: false }
                ],
                reviews: [
                    { id: 4, rating: 5, comment: "Best PG for Galgotias and Sharda students! Metro station is very close.", reviewDate: "2026-09-28", user: { name: "Rahul Verma" } }
                ]
            }
        ];

        const mockBookings = [
            {
                id: 1,
                user: mockUsers[3],
                property: mockProperties[0],
                room: mockProperties[0].rooms[1],
                bookingDate: "2026-09-25",
                checkInDate: "2026-10-05",
                durationMonths: 3,
                status: "APPROVED",
                remarks: "Internship at Infosys Electronic City."
            },
            {
                id: 2,
                user: mockUsers[4],
                property: mockProperties[1],
                room: mockProperties[1].rooms[1],
                bookingDate: "2026-09-30",
                checkInDate: "2026-10-10",
                durationMonths: 6,
                status: "PENDING",
                remarks: "MBA student at Symbiosis. Please confirm double sharing room."
            }
        ];

        localStorage.setItem('pgh_mock_users', JSON.stringify(mockUsers));
        localStorage.setItem('pgh_mock_properties', JSON.stringify(mockProperties));
        localStorage.setItem('pgh_mock_bookings', JSON.stringify(mockBookings));
        localStorage.setItem('pgh_mock_initialized', 'true');
        localStorage.setItem('pgh_mock_v7', 'true');
    }
}

initMockDb();

// Reconcile and ensure latest address for Puja Girls PG in localStorage
try {
    const rawP = localStorage.getItem('pgh_mock_properties');
    if (rawP) {
        const list = JSON.parse(rawP);
        let updated = false;
        list.forEach(p => {
            if (p.propertyName && p.propertyName.toLowerCase().includes('puja')) {
                p.address = 'Beta 1, B-Block, Near Jagat Farm Market';
                p.city = 'Greater Noida';
                p.state = 'Uttar Pradesh';
                p.pincode = '201308';
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('pgh_mock_properties', JSON.stringify(list));
        }
    }
} catch (e) {}

// Reconcile Mansi Singh (Student) into pgh_mock_users
try {
    const rawU = localStorage.getItem('pgh_mock_users');
    let uList = rawU ? JSON.parse(rawU) : [];
    if (!uList.some(u => u.email && u.email.toLowerCase() === 'salonikumari1562001@gmail.com')) {
        uList.push({
            id: 7,
            name: "Mansi Singh",
            email: "salonikumari1562001@gmail.com",
            phone: "9876543211",
            password: "user123",
            role: "USER",
            createdAt: "2026-09-18T10:00:00"
        });
        localStorage.setItem('pgh_mock_users', JSON.stringify(uList));
    }
} catch (e) {}

// Reconcile booking for Puja Girls PG so Mansi Kumari's Owner Dashboard immediately shows requests
try {
    const rawB = localStorage.getItem('pgh_mock_bookings');
    let bList = rawB ? JSON.parse(rawB) : [];
    const hasPujaBooking = bList.some(b => b.property && b.property.propertyName && b.property.propertyName.toLowerCase().includes('puja'));
    if (!hasPujaBooking) {
        const rawProps = localStorage.getItem('pgh_mock_properties');
        const pList = rawProps ? JSON.parse(rawProps) : [];
        const pujaProp = pList.find(p => p.propertyName && p.propertyName.toLowerCase().includes('puja'));
        if (pujaProp) {
            const rawU = localStorage.getItem('pgh_mock_users');
            const uList = rawU ? JSON.parse(rawU) : [];
            const mansiUser = uList.find(u => u.email && u.email.toLowerCase() === 'salonikumari1562001@gmail.com') || { id: 7, name: "Mansi Singh", phone: "9876543211", email: "salonikumari1562001@gmail.com" };
            bList.unshift({
                id: Math.floor(1000 + Math.random() * 9000),
                user: mansiUser,
                property: pujaProp,
                room: (pujaProp.rooms && pujaProp.rooms[1]) ? pujaProp.rooms[1] : (pujaProp.rooms ? pujaProp.rooms[0] : null),
                checkInDate: "2026-10-04",
                durationMonths: 3,
                status: "PENDING",
                remarks: "Student preparing for competitive exams near Jagat Farm."
            });
            localStorage.setItem('pgh_mock_bookings', JSON.stringify(bList));
        }
    }
} catch (e) {}

let isBackendLive = false;

// Check backend connectivity with 800ms timeout
async function testBackend() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch(`${API_BASE}/properties`, { signal: controller.signal });
        clearTimeout(timeoutId);
        isBackendLive = res.ok;
    } catch (e) {
        isBackendLive = false;
    }
}

const API = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            // Fallback to local mock when server is unreachable
        }
        return this.mockGet(endpoint);
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const res = await response.json();
                try { this.mockPost(endpoint, data); } catch (err) {}
                return res;
            } else {
                try {
                    const errRes = await response.json();
                    if (errRes && (errRes.message || errRes.success === false)) {
                        return errRes;
                    }
                } catch (jsonErr) {}
            }
        } catch (e) {
            // Fallback to local mock
        }
        return this.mockPost(endpoint, data);
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) return await response.json();
        } catch (e) {}
        return { success: true, message: "Updated" };
    },

    async patch(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, { method: 'PATCH' });
            if (response.ok) {
                try { this.mockPatch(endpoint); } catch (err) {}
                return await response.json();
            }
        } catch (e) {}
        return this.mockPatch(endpoint);
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
            if (response.ok) {
                try { this.mockDelete(endpoint); } catch (err) {}
                return await response.json();
            } else {
                try {
                    const errRes = await response.json();
                    if (errRes && (errRes.message || errRes.success === false)) {
                        return errRes;
                    }
                } catch (jsonErr) {}
                return { success: false, message: `Server error (${response.status})` };
            }
        } catch (e) {
            // Offline/fallback to mock
        }
        return this.mockDelete(endpoint);
    },

    // --- MOCK CONTROLLER IMPLEMENTATIONS ---
    mockGet(endpoint) {
        const properties = JSON.parse(localStorage.getItem('pgh_mock_properties') || '[]');
        const bookings = JSON.parse(localStorage.getItem('pgh_mock_bookings') || '[]');
        const users = JSON.parse(localStorage.getItem('pgh_mock_users') || '[]');

        if (endpoint.startsWith('/properties/owner/')) {
            const url = new URL('http://dummy.com' + endpoint);
            const pathParts = url.pathname.split('/');
            const ownerId = pathParts[pathParts.length - 1];
            const ownerEmail = url.searchParams.get('ownerEmail');
            const currentUser = JSON.parse(localStorage.getItem('pgh_user') || '{}');

            const filtered = properties.filter(p => {
                if (!p.owner) return false;
                if (p.owner.id == ownerId) return true;
                if (ownerEmail && p.owner.email && p.owner.email.toLowerCase() === ownerEmail.toLowerCase()) return true;
                if (currentUser.email && p.owner.email && p.owner.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
                return false;
            });
            return { success: true, data: filtered };
        }

        if (endpoint.startsWith('/reviews/property/')) {
            const propId = parseInt(endpoint.split('/').pop());
            const prop = properties.find(p => p.id === propId || p.id == propId);
            return { success: true, data: (prop && prop.reviews) ? prop.reviews : [] };
        }

        if (endpoint.startsWith('/properties/all')) {
            return { success: true, data: properties };
        }

        if (endpoint.startsWith('/properties/')) {
            const id = parseInt(endpoint.split('/').pop());
            const found = properties.find(p => p.id === id);
            return found ? { success: true, data: found } : { success: false, message: "Not found" };
        }

        if (endpoint.startsWith('/properties')) {
            const url = new URL('http://dummy.com' + endpoint);
            const city = url.searchParams.get('city');
            const gender = url.searchParams.get('genderType');
            const maxRent = url.searchParams.get('maxRent');
            const keyword = url.searchParams.get('keyword');

            let result = properties.filter(p => p.status === 'Active');
            if (city) result = result.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
            if (gender) result = result.filter(p => p.genderType === gender);
            if (maxRent) result = result.filter(p => p.rent <= parseFloat(maxRent));
            if (keyword) {
                const kw = keyword.toLowerCase();
                result = result.filter(p => p.propertyName.toLowerCase().includes(kw) || p.address.toLowerCase().includes(kw));
            }
            return { success: true, data: result };
        }

        if (endpoint.startsWith('/bookings/all') || endpoint === '/bookings') {
            return { success: true, data: bookings };
        }

        if (endpoint.startsWith('/bookings/user/')) {
            const userId = parseInt(endpoint.split('/').pop());
            const userBookings = bookings.filter(b => b.user && b.user.id === userId);
            return { success: true, data: userBookings };
        }

        if (endpoint.startsWith('/bookings/owner/')) {
            const url = new URL('http://dummy.com' + endpoint);
            const pathParts = url.pathname.split('/');
            const ownerId = pathParts[pathParts.length - 1];
            const ownerEmail = url.searchParams.get('ownerEmail');
            const currentUser = JSON.parse(localStorage.getItem('pgh_user') || '{}');

            const ownerBookings = bookings.filter(b => {
                if (!b.property || !b.property.owner) return false;
                const o = b.property.owner;
                if (o.id == ownerId) return true;
                if (ownerEmail && o.email && o.email.toLowerCase() === ownerEmail.toLowerCase()) return true;
                if (currentUser.email && o.email && o.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
                return false;
            });
            return { success: true, data: ownerBookings };
        }

        if (endpoint.startsWith('/admin/stats')) {
            const students = users.filter(u => u.role === 'USER').length;
            const owners = users.filter(u => u.role === 'OWNER').length;
            return {
                success: true,
                data: {
                    totalStudents: students,
                    totalOwners: owners,
                    activeProperties: properties.length,
                    totalBookings: bookings.length
                }
            };
        }

        if (endpoint.startsWith('/admin/users')) {
            return { success: true, data: users };
        }

        return { success: true, data: [] };
    },

    mockPost(endpoint, data) {
        const properties = JSON.parse(localStorage.getItem('pgh_mock_properties') || '[]');
        const bookings = JSON.parse(localStorage.getItem('pgh_mock_bookings') || '[]');
        const users = JSON.parse(localStorage.getItem('pgh_mock_users') || '[]');

        if (endpoint === '/auth/login') {
            const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password);
            if (user) {
                return { success: true, data: user };
            }
            return { success: false, message: "Invalid email or password credentials." };
        }

        if (endpoint === '/auth/register') {
            if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
                return { success: false, message: "Email already registered." };
            }
            const newUser = { id: Date.now(), ...data, createdAt: new Date().toISOString() };
            users.push(newUser);
            localStorage.setItem('pgh_mock_users', JSON.stringify(users));
            return { success: true, data: newUser };
        }

        if (endpoint === '/bookings') {
            const user = users.find(u => u.id === data.userId);
            const prop = properties.find(p => p.id === data.propertyId);
            const room = prop ? prop.rooms.find(r => r.id === data.roomId) : null;

            const newBooking = {
                id: Math.floor(1000 + Math.random() * 9000),
                user: user,
                property: prop,
                room: room,
                checkInDate: data.checkInDate,
                durationMonths: data.durationMonths,
                status: "PENDING",
                remarks: data.remarks
            };
            bookings.unshift(newBooking);
            localStorage.setItem('pgh_mock_bookings', JSON.stringify(bookings));
            return { success: true, data: newBooking };
        }

        if (endpoint.includes('/pay')) {
            const url = new URL('http://dummy.com' + endpoint);
            const pathParts = url.pathname.split('/');
            const payIdx = pathParts.indexOf('pay');
            const bookingId = parseInt(pathParts[payIdx - 1]);
            const amount = parseFloat(url.searchParams.get('amount') || (data && data.amount) || 5000);
            const method = url.searchParams.get('method') || (data && data.method) || 'UPI';
            const txnId = url.searchParams.get('transactionId') || (data && data.transactionId) || ('TXN_' + Date.now());

            const bIndex = bookings.findIndex(b => b.id === bookingId);
            if (bIndex !== -1) {
                bookings[bIndex].paymentStatus = 'PAID';
                bookings[bIndex].amountPaid = amount;
                bookings[bIndex].paymentMethod = method;
                bookings[bIndex].transactionId = txnId;
                bookings[bIndex].paidAt = new Date().toISOString();
                localStorage.setItem('pgh_mock_bookings', JSON.stringify(bookings));
                return { success: true, message: "Payment recorded successfully!", data: bookings[bIndex] };
            }
        }

        if (endpoint.startsWith('/properties')) {
            const url = new URL('http://dummy.com' + endpoint);
            const ownerId = url.searchParams.get('ownerId');
            const ownerEmail = url.searchParams.get('ownerEmail');
            const currentUser = JSON.parse(localStorage.getItem('pgh_user') || '{}');

            let owner = users.find(u => (ownerId && u.id == ownerId) || (ownerEmail && u.email && u.email.toLowerCase() === ownerEmail.toLowerCase()));
            if (!owner) {
                owner = (currentUser && currentUser.name) ? currentUser : users[1];
            }

            const newProp = {
                id: Date.now(),
                ...data,
                owner: owner,
                verified: true,
                status: 'Active',
                averageRating: 5.0,
                totalAvailableRooms: 2,
                rooms: [
                    { id: Date.now() + 1, roomType: 'DOUBLE', roomNumber: '101', rent: data.rent, capacity: 2, availableRooms: 2, acAvailable: true }
                ],
                reviews: []
            };
            properties.unshift(newProp);
            localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
            return { success: true, data: newProp };
        }

        if (endpoint.startsWith('/rooms/property/')) {
            const propId = parseInt(endpoint.split('/').pop());
            const prop = properties.find(p => p.id === propId);
            if (prop) {
                const newRoom = { id: Date.now(), ...data };
                if (!prop.rooms) prop.rooms = [];
                prop.rooms.push(newRoom);
                prop.totalAvailableRooms = (prop.totalAvailableRooms || 0) + newRoom.availableRooms;
                localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
                return { success: true, data: newRoom };
            }
        }

        if (endpoint === '/reviews') {
            const propId = parseInt(data.propertyId);
            const prop = properties.find(p => p.id === propId || p.id == data.propertyId);
            let user = users.find(u => (data.userId && u.id == data.userId) || (data.userEmail && u.email && u.email.toLowerCase() === data.userEmail.toLowerCase()));
            if (!user) {
                const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
                user = {
                    id: data.userId || Date.now(),
                    name: data.userName || (currentUser ? currentUser.name : "Resident"),
                    email: data.userEmail || (currentUser ? currentUser.email : "")
                };
            }
            if (prop) {
                if (!prop.reviews) prop.reviews = [];
                const existingIndex = prop.reviews.findIndex(r => 
                    (r.user && r.user.name && r.user.name.toLowerCase() === user.name.toLowerCase()) ||
                    (r.user && r.user.id && user.id && r.user.id == user.id)
                );

                if (existingIndex >= 0) {
                    prop.reviews[existingIndex].rating = data.rating;
                    prop.reviews[existingIndex].comment = data.comment;
                    prop.reviews[existingIndex].reviewDate = new Date().toISOString().split('T')[0];
                } else {
                    prop.reviews.unshift({
                        id: Date.now(),
                        rating: data.rating,
                        comment: data.comment,
                        reviewDate: new Date().toISOString().split('T')[0],
                        user: { id: user.id, name: user.name }
                    });
                }

                const totalRating = prop.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
                prop.averageRating = prop.reviews.length > 0 ? (Math.round((totalRating / prop.reviews.length) * 10) / 10) : 5.0;

                localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
                return { success: true, message: "Review recorded successfully", data: prop };
            }
        }

        return { success: true };
    },

    mockPatch(endpoint) {
        const bookings = JSON.parse(localStorage.getItem('pgh_mock_bookings') || '[]');
        const properties = JSON.parse(localStorage.getItem('pgh_mock_properties') || '[]');

        if (endpoint.startsWith('/bookings/')) {
            const url = new URL('http://dummy.com' + endpoint);
            const bookingId = parseInt(url.pathname.split('/')[2]);
            const newStatus = url.searchParams.get('status');

            const booking = bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = newStatus;
                localStorage.setItem('pgh_mock_bookings', JSON.stringify(bookings));
                return { success: true, data: booking };
            }
        }

        if (endpoint.includes('/verify')) {
            const id = parseInt(endpoint.split('/')[2]);
            const prop = properties.find(p => p.id === id);
            if (prop) {
                prop.verified = !prop.verified;
                localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
                return { success: true, data: prop };
            }
        }

        if (endpoint.includes('/status')) {
            const id = parseInt(endpoint.split('/')[2]);
            const prop = properties.find(p => p.id === id);
            if (prop) {
                prop.status = prop.status === 'Active' ? 'Inactive' : 'Active';
                localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
                return { success: true, data: prop };
            }
        }

        return { success: true };
    },

    mockDelete(endpoint) {
        let properties = JSON.parse(localStorage.getItem('pgh_mock_properties') || '[]');
        let bookings = JSON.parse(localStorage.getItem('pgh_mock_bookings') || '[]');
        if (endpoint.startsWith('/properties/')) {
            const id = endpoint.split('/').pop();
            properties = properties.filter(p => p.id != id);
            bookings = bookings.filter(b => (!b.property || b.property.id != id) && b.propertyId != id);
            localStorage.setItem('pgh_mock_properties', JSON.stringify(properties));
            localStorage.setItem('pgh_mock_bookings', JSON.stringify(bookings));
            return { success: true };
        }
        return { success: true };
    }
};

// UI Notification / Alert Helper
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alert(message);
        return;
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>${type === 'danger' ? 'Error!' : (type === 'success' ? 'Success!' : 'Notice:')}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alertDiv);
    try { alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (err) {}
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 250);
    }, 4500);
}
