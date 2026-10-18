package com.hostel.pghfinder.config;

import com.hostel.pghfinder.entity.*;
import com.hostel.pghfinder.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           PropertyRepository propertyRepository,
                           RoomRepository roomRepository,
                           BookingRepository bookingRepository,
                           ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        propertyRepository.findAll().stream()
                .filter(p -> p.getPropertyName() != null && p.getPropertyName().toLowerCase().contains("puja"))
                .forEach(p -> {
                    p.setAddress("Beta 1, B-Block, Near Jagat Farm Market");
                    p.setCity("Greater Noida");
                    p.setState("Uttar Pradesh");
                    p.setPincode("201308");
                    propertyRepository.save(p);
                });

        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println("🌱 Initializing sample PG/Hostel database records...");

        // 1. Create Default Users
        User admin = new User(null, "System Administrator", "admin@pghfinder.com", "9876543210", "admin123", Role.ADMIN);
        User owner1 = new User(null, "Rajesh Sharma", "rajesh.owner@example.com", "9811223344", "owner123", Role.OWNER);
        User owner2 = new User(null, "Priya Kulkarni", "priya.owner@example.com", "9822334455", "owner123", Role.OWNER);
        User mansiOwner = new User(null, "Mansi Kumari", "monalsinghrajput1310@gmail.com", "9876543210", "owner123", Role.OWNER);
        User student1 = new User(null, "Rahul Verma", "rahul.student@example.com", "9933445566", "user123", Role.USER);
        User student2 = new User(null, "Sneha Patel", "sneha.student@example.com", "9944556677", "user123", Role.USER);
        User mansiStudent = new User(null, "Mansi Singh", "salonikumari1562001@gmail.com", "9876543211", "user123", Role.USER);

        userRepository.saveAll(Arrays.asList(admin, owner1, owner2, mansiOwner, student1, student2, mansiStudent));

        // 2. Create Properties
        // Property 1: Bangalore - Boys PG
        Property p1 = new Property();
        p1.setOwner(owner1);
        p1.setPropertyName("Green Valley Luxury PG for Men");
        p1.setAddress("45, Neeladri Road, Electronic City Phase 1");
        p1.setCity("Bengaluru");
        p1.setState("Karnataka");
        p1.setPincode("560100");
        p1.setRent(7500.0);
        p1.setDeposit(12000.0);
        p1.setGenderType(GenderType.BOYS);
        p1.setDescription("Premium paying guest accommodation located in the heart of Electronic City. Ideal for tech professionals and students. 3 times hygienic home-style food, daily housekeeping, and 24/7 security.");
        p1.setRules("Gate closes at 11:00 PM. No smoking or alcohol inside premises. Visitors allowed in lobby only.");
        p1.setContactPhone("9811223344");
        p1.setContactEmail("greenvalley@example.com");
        p1.setImageUrl("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80");
        p1.setAmenities(Arrays.asList("High-speed Wi-Fi", "3-Time Homestyle Food", "Daily Housekeeping", "CCTV Surveillance", "Power Backup", "Washing Machine", "Geyser"));
        p1.setVerified(true);
        p1.setStatus("Active");
        p1 = propertyRepository.save(p1);

        // Rooms for Property 1
        Room r1_1 = new Room(null, p1, RoomType.SINGLE, "101", 12000.0, 1, 3, true);
        Room r1_2 = new Room(null, p1, RoomType.DOUBLE, "102", 7500.0, 2, 6, true);
        Room r1_3 = new Room(null, p1, RoomType.TRIPLE, "103", 6000.0, 3, 9, false);
        roomRepository.saveAll(Arrays.asList(r1_1, r1_2, r1_3));

        // Property 2: Pune - Girls PG
        Property p2 = new Property();
        p2.setOwner(owner2);
        p2.setPropertyName("Sai Serene Living Ladies Hostel");
        p2.setAddress("12, Clover Park, Viman Nagar near Symbiosis");
        p2.setCity("Pune");
        p2.setState("Maharashtra");
        p2.setPincode("411014");
        p2.setRent(8000.0);
        p2.setDeposit(15000.0);
        p2.setGenderType(GenderType.GIRLS);
        p2.setDescription("Safe, modern, and vibrant hostel exclusively for female students and working professionals. Walking distance to Symbiosis colleges and Phoenix Marketcity. Biometric security and warden on premises.");
        p2.setRules("Biometric entry by 10:30 PM. Overnight male visitors strictly prohibited. Silent hours after 11 PM.");
        p2.setContactPhone("9822334455");
        p2.setContactEmail("saiserene@example.com");
        p2.setImageUrl("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80");
        p2.setAmenities(Arrays.asList("High-speed Wi-Fi", "Biometric Access", "North & South Indian Meals", "Air Conditioning", "Refrigerator", "Washing Machine", "RO Water"));
        p2.setVerified(true);
        p2.setStatus("Active");
        p2 = propertyRepository.save(p2);

        // Rooms for Property 2
        Room r2_1 = new Room(null, p2, RoomType.SINGLE, "201", 14000.0, 1, 2, true);
        Room r2_2 = new Room(null, p2, RoomType.DOUBLE, "202", 8000.0, 2, 8, true);
        Room r2_3 = new Room(null, p2, RoomType.TRIPLE, "203", 6500.0, 3, 6, false);
        roomRepository.saveAll(Arrays.asList(r2_1, r2_2, r2_3));

        // Property 3: Delhi NCR / Gurgaon - Co-ed PG
        Property p3 = new Property();
        p3.setOwner(owner1);
        p3.setPropertyName("Urban Nest Co-Living Spaces");
        p3.setAddress("Plot 24, Sector 48, Sohna Road");
        p3.setCity("Delhi NCR");
        p3.setState("Haryana");
        p3.setPincode("122018");
        p3.setRent(9500.0);
        p3.setDeposit(18000.0);
        p3.setGenderType(GenderType.CO_ED);
        p3.setDescription("Contemporary co-living space with recreation room, gym, dedicated workstations, and vibrant community events. Perfect for corporate employees and freelancers seeking hotel-like comfort.");
        p3.setRules("24/7 entry permitted with smart card. Maintain cleanliness in common spaces.");
        p3.setContactPhone("9811223344");
        p3.setContactEmail("urbannest@example.com");
        p3.setImageUrl("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80");
        p3.setAmenities(Arrays.asList("High-speed Wi-Fi", "Coworking Space", "Gym & Games", "All-Meals Included", "Lift", "24/7 Power Backup", "Smart TV"));
        p3.setVerified(true);
        p3.setStatus("Active");
        p3 = propertyRepository.save(p3);

        // Rooms for Property 3
        Room r3_1 = new Room(null, p3, RoomType.SINGLE, "301", 16000.0, 1, 4, true);
        Room r3_2 = new Room(null, p3, RoomType.DOUBLE, "302", 9500.0, 2, 10, true);
        roomRepository.saveAll(Arrays.asList(r3_1, r3_2));

        // Property 4: Hyderabad - Co-ed PG
        Property p4 = new Property();
        p4.setOwner(owner2);
        p4.setPropertyName("Cyber Towers Elite PG & Hostel");
        p4.setAddress("Lane 3, Madhapur, near Hitec City Metro");
        p4.setCity("Hyderabad");
        p4.setState("Telangana");
        p4.setPincode("500081");
        p4.setRent(6500.0);
        p4.setDeposit(10000.0);
        p4.setGenderType(GenderType.CO_ED);
        p4.setDescription("Affordable and convenient PG situated right next to the Madhapur metro station. Surrounded by major tech parks. Delicious South & North Indian buffets, spacious cupboards, and study tables.");
        p4.setRules("Visitors allowed until 9:00 PM. Cleanliness in dining hall mandatory.");
        p4.setContactPhone("9822334455");
        p4.setContactEmail("cybertowers@example.com");
        p4.setImageUrl("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80");
        p4.setAmenities(Arrays.asList("High-speed Wi-Fi", "Buffet Breakfast & Dinner", "Attached Washrooms", "Laundry Facility", "Bike Parking", "CCTV"));
        p4.setVerified(true);
        p4.setStatus("Active");
        p4 = propertyRepository.save(p4);

        Room r4_1 = new Room(null, p4, RoomType.DOUBLE, "401", 7500.0, 2, 5, true);
        Room r4_2 = new Room(null, p4, RoomType.FOUR_SHARING, "402", 5500.0, 4, 12, false);
        roomRepository.saveAll(Arrays.asList(r4_1, r4_2));

        // Property 5: Patna - Girls PG
        Property p5 = new Property();
        p5.setOwner(owner2);
        p5.setPropertyName("Magadh Royal Girls Hostel & PG");
        p5.setAddress("Opp. A.N. College, Boring Road");
        p5.setCity("Patna");
        p5.setState("Bihar");
        p5.setPincode("800013");
        p5.setRent(6500.0);
        p5.setDeposit(8000.0);
        p5.setGenderType(GenderType.GIRLS);
        p5.setDescription("Clean, peaceful, and highly secure hostel for girl students preparing for competitive exams or studying in Patna. 3 meals included, study library, and CCTV security.");
        p5.setRules("Entry closes at 9:30 PM. Silence hours after 10 PM. No outside guests permitted.");
        p5.setContactPhone("9835012345");
        p5.setContactEmail("magadhhostel@example.com");
        p5.setImageUrl("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80");
        p5.setAmenities(Arrays.asList("High-speed Wi-Fi", "3-Time Hygienic Food", "Study Table & Chair", "RO Drinking Water", "CCTV Security", "Power Backup"));
        p5.setVerified(true);
        p5.setStatus("Active");
        p5 = propertyRepository.save(p5);

        Room r5_1 = new Room(null, p5, RoomType.SINGLE, "G-101", 9000.0, 1, 3, true);
        Room r5_2 = new Room(null, p5, RoomType.DOUBLE, "G-102", 6500.0, 2, 8, false);
        Room r5_3 = new Room(null, p5, RoomType.TRIPLE, "G-103", 5000.0, 3, 4, false);
        roomRepository.saveAll(Arrays.asList(r5_1, r5_2, r5_3));

        // Property 6: Muzaffarpur - Boys PG
        Property p6 = new Property();
        p6.setOwner(owner1);
        p6.setPropertyName("Tirhut Executive Boys PG");
        p6.setAddress("Near MIT Campus, Mithanpura");
        p6.setCity("Muzaffarpur");
        p6.setState("Bihar");
        p6.setPincode("842002");
        p6.setRent(5500.0);
        p6.setDeposit(6000.0);
        p6.setGenderType(GenderType.BOYS);
        p6.setDescription("Spacious and affordable PG for engineering students and working professionals in Muzaffarpur. Walking distance to MIT and coaching centers.");
        p6.setRules("Gate closes at 10:00 PM. Keep premises neat and clean.");
        p6.setContactPhone("9835123456");
        p6.setContactEmail("tirhutpg@example.com");
        p6.setImageUrl("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80");
        p6.setAmenities(Arrays.asList("Wi-Fi", "Daily Breakfast & Dinner", "Bike Parking", "Inverter Backup", "Geyser"));
        p6.setVerified(true);
        p6.setStatus("Active");
        p6 = propertyRepository.save(p6);

        Room r6_1 = new Room(null, p6, RoomType.SINGLE, "B-201", 8000.0, 1, 2, true);
        Room r6_2 = new Room(null, p6, RoomType.DOUBLE, "B-202", 5500.0, 2, 6, false);
        Room r6_3 = new Room(null, p6, RoomType.TRIPLE, "B-203", 4200.0, 3, 4, false);
        roomRepository.saveAll(Arrays.asList(r6_1, r6_2, r6_3));

        // Property 7: Hajipur - Co-ed PG
        Property p7 = new Property();
        p7.setOwner(owner2);
        p7.setPropertyName("Vaishali Green View PG & Hostel");
        p7.setAddress("Cinema Road, Near Hajipur Railway Station");
        p7.setCity("Hajipur");
        p7.setState("Bihar");
        p7.setPincode("844101");
        p7.setRent(4800.0);
        p7.setDeposit(5000.0);
        p7.setGenderType(GenderType.CO_ED);
        p7.setDescription("Modern PG situated adjacent to Hajipur Junction. Convenient commuting to Patna via Digha Bridge. Features home-cooked vegetarian food.");
        p7.setRules("Late night entry with prior intimation only. Strict discipline inside hostel.");
        p7.setContactPhone("9835234567");
        p7.setContactEmail("vaishalipg@example.com");
        p7.setImageUrl("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80");
        p7.setAmenities(Arrays.asList("High-speed Wi-Fi", "Homestyle Food", "RO Water", "Parking Space", "CCTV"));
        p7.setVerified(true);
        p7.setStatus("Active");
        p7 = propertyRepository.save(p7);

        Room r7_1 = new Room(null, p7, RoomType.DOUBLE, "V-101", 4800.0, 2, 6, false);
        Room r7_2 = new Room(null, p7, RoomType.TRIPLE, "V-102", 3800.0, 3, 4, false);
        roomRepository.saveAll(Arrays.asList(r7_1, r7_2));

        // Property 8: Greater Noida - Puja Girls PG (Owned by Mansi Kumari)
        Property p8 = new Property();
        p8.setOwner(mansiOwner);
        p8.setPropertyName("Puja Girls PG");
        p8.setAddress("Beta 1, B-Block, Near Jagat Farm Market");
        p8.setCity("Greater Noida");
        p8.setState("Uttar Pradesh");
        p8.setPincode("201308");
        p8.setRent(6000.0);
        p8.setDeposit(7000.0);
        p8.setGenderType(GenderType.GIRLS);
        p8.setDescription("Safe, peaceful, and fully-furnished Girls PG located in Beta 1, B-Block, right next to Jagat Farm Market. Ideal for female students and working professionals. Walking distance to markets, coaching, and metro. Includes 3-times hygienic home-cooked food, high-speed Wi-Fi, study table, and 24/7 CCTV security.");
        p8.setRules("Gate closes at 9:30 PM. Silence hours after 10:00 PM. Outside visitors allowed in reception area only.");
        p8.setContactPhone("9876543210");
        p8.setContactEmail("monalsinghrajput1310@gmail.com");
        p8.setImageUrl("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80");
        p8.setAmenities(Arrays.asList("High-speed Wi-Fi", "3-Time Homestyle Food", "RO Water", "CCTV Security", "Study Table & Chair", "Power Backup", "Washing Machine"));
        p8.setVerified(true);
        p8.setStatus("Active");
        p8 = propertyRepository.save(p8);

        Room r8_1 = new Room(null, p8, RoomType.SINGLE, "P-101", 8500.0, 1, 3, true);
        Room r8_2 = new Room(null, p8, RoomType.DOUBLE, "P-102", 6000.0, 2, 6, false);
        Room r8_3 = new Room(null, p8, RoomType.TRIPLE, "P-103", 4500.0, 3, 6, false);
        roomRepository.saveAll(Arrays.asList(r8_1, r8_2, r8_3));

        // Property 9: Greater Noida - Knowledge Park Residency & PG
        Property p9 = new Property();
        p9.setOwner(owner1);
        p9.setPropertyName("Knowledge Park Residency & PG");
        p9.setAddress("Plot 12, Knowledge Park II, Near Pari Chowk Metro");
        p9.setCity("Greater Noida");
        p9.setState("Uttar Pradesh");
        p9.setPincode("201310");
        p9.setRent(7000.0);
        p9.setDeposit(10000.0);
        p9.setGenderType(GenderType.CO_ED);
        p9.setDescription("Top-rated student accommodation in Knowledge Park II. Walking distance from major colleges, Galgotias, Sharda University, and Pari Chowk metro. 3 meals, power backup, and high-speed Wi-Fi included.");
        p9.setRules("Entry allowed until 10:30 PM with smart card. Visitor access in common area only.");
        p9.setContactPhone("9811223344");
        p9.setContactEmail("knowledgeparkpg@example.com");
        p9.setImageUrl("https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80");
        p9.setAmenities(Arrays.asList("High-speed Wi-Fi", "3-Time Hygienic Food", "Air Conditioning", "Power Backup", "Gym & Games", "CCTV Security", "Washing Machine"));
        p9.setVerified(true);
        p9.setStatus("Active");
        p9 = propertyRepository.save(p9);

        Room r9_1 = new Room(null, p9, RoomType.SINGLE, "KP-101", 11000.0, 1, 4, true);
        Room r9_2 = new Room(null, p9, RoomType.DOUBLE, "KP-102", 7000.0, 2, 8, true);
        Room r9_3 = new Room(null, p9, RoomType.TRIPLE, "KP-103", 5500.0, 3, 6, false);
        roomRepository.saveAll(Arrays.asList(r9_1, r9_2, r9_3));

        // 3. Create Sample Bookings
        Booking b1 = new Booking();
        b1.setUser(student1);
        b1.setProperty(p1);
        b1.setRoom(r1_2);
        b1.setBookingDate(LocalDate.now().minusDays(5));
        b1.setCheckInDate(LocalDate.now().plusDays(2));
        b1.setDurationMonths(3);
        b1.setCheckOutDate(LocalDate.now().plusMonths(3));
        b1.setStatus(BookingStatus.APPROVED);
        b1.setRemarks("Joining internship at Infosys Electronic City.");
        bookingRepository.save(b1);

        Booking b2 = new Booking();
        b2.setUser(student2);
        b2.setProperty(p2);
        b2.setRoom(r2_2);
        b2.setBookingDate(LocalDate.now().minusDays(1));
        b2.setCheckInDate(LocalDate.now().plusDays(7));
        b2.setDurationMonths(6);
        b2.setCheckOutDate(LocalDate.now().plusMonths(6));
        b2.setStatus(BookingStatus.PENDING);
        b2.setRemarks("First year MBA student at Symbiosis. Please confirm double sharing room.");
        bookingRepository.save(b2);

        // Booking 3: Mansi Singh -> Puja Girls PG (Greater Noida, Owned by Mansi Kumari)
        Booking b3 = new Booking();
        b3.setUser(mansiStudent);
        b3.setProperty(p8);
        b3.setRoom(r8_2);
        b3.setBookingDate(LocalDate.now());
        b3.setCheckInDate(LocalDate.now().plusDays(2));
        b3.setDurationMonths(3);
        b3.setCheckOutDate(LocalDate.now().plusMonths(3));
        b3.setStatus(BookingStatus.PENDING);
        b3.setRemarks("Student preparing for competitive exams near Jagat Farm.");
        bookingRepository.save(b3);

        // Booking 4: Mansi Singh -> Magadh Royal Girls Hostel & PG (Patna, Owned by Priya Kulkarni)
        Booking b4 = new Booking();
        b4.setUser(mansiStudent);
        b4.setProperty(p5);
        b4.setRoom(r5_1);
        b4.setBookingDate(LocalDate.now().minusDays(1));
        b4.setCheckInDate(LocalDate.now().plusDays(1));
        b4.setDurationMonths(3);
        b4.setCheckOutDate(LocalDate.now().plusMonths(3));
        b4.setStatus(BookingStatus.PENDING);
        b4.setRemarks("Student at A.N. College.");
        bookingRepository.save(b4);

        // 4. Create Sample Reviews
        Review rev1 = new Review(null, student1, p1, 5, "Amazing food and super fast Wi-Fi! The owner Rajesh is very helpful and always responsive.");
        Review rev2 = new Review(null, student2, p2, 4, "Very safe environment for girls, clean rooms and walking distance to college.");
        reviewRepository.saveAll(Arrays.asList(rev1, rev2));

        System.out.println("✅ Sample database records successfully loaded!");
    }
}
