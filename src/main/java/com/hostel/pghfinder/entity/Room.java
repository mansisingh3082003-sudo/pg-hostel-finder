package com.hostel.pghfinder.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    @JsonIgnoreProperties({"rooms", "reviews", "owner"})
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false, length = 30)
    private RoomType roomType;

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    @NotNull(message = "Rent is required")
    @Column(nullable = false)
    private Double rent;

    @NotNull(message = "Capacity is required")
    @Column(nullable = false)
    private Integer capacity;

    @NotNull(message = "Available rooms count is required")
    @Column(name = "available_rooms", nullable = false)
    private Integer availableRooms;

    @Column(name = "ac_available")
    private Boolean acAvailable = false;

    public Room() {
    }

    public Room(Long id, Property property, RoomType roomType, String roomNumber, Double rent, Integer capacity, Integer availableRooms, Boolean acAvailable) {
        this.id = id;
        this.property = property;
        this.roomType = roomType;
        this.roomNumber = roomNumber;
        this.rent = rent;
        this.capacity = capacity;
        this.availableRooms = availableRooms;
        this.acAvailable = acAvailable;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Double getRent() {
        return rent;
    }

    public void setRent(Double rent) {
        this.rent = rent;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }

    public Boolean getAcAvailable() {
        return acAvailable;
    }

    public void setAcAvailable(Boolean acAvailable) {
        this.acAvailable = acAvailable;
    }
}
