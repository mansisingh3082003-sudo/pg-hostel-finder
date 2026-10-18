package com.hostel.pghfinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PghFinderApplication {

    public static void main(String[] args) {
        SpringApplication.run(PghFinderApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 PG & Hostel Finder Application started successfully!");
        System.out.println("🌐 Web UI:        http://localhost:8081/");
        System.out.println("📊 H2 DB Console: http://localhost:8081/h2-console");
        System.out.println("🔑 Default Admin: admin@pghfinder.com / admin123");
        System.out.println("🔑 Sample Owner:  rajesh.owner@example.com / owner123");
        System.out.println("🔑 Sample User:   rahul.student@example.com / user123");
        System.out.println("==================================================================");
    }
}
