package com.hostel.pghfinder.service;

import com.hostel.pghfinder.entity.Property;
import com.hostel.pghfinder.entity.Room;
import com.hostel.pghfinder.repository.PropertyRepository;
import com.hostel.pghfinder.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;

    @Autowired
    public RoomService(RoomRepository roomRepository, PropertyRepository propertyRepository) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
    }

    public List<Room> getRoomsByPropertyId(Long propertyId) {
        return roomRepository.findByPropertyId(propertyId);
    }

    public Room getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
    }

    public Room addRoom(Long propertyId, Room room) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        room.setProperty(property);
        return roomRepository.save(room);
    }

    public Room updateRoom(Long roomId, Room updated) {
        Room existing = getRoomById(roomId);
        existing.setRoomType(updated.getRoomType());
        existing.setRoomNumber(updated.getRoomNumber());
        existing.setRent(updated.getRent());
        existing.setCapacity(updated.getCapacity());
        existing.setAvailableRooms(updated.getAvailableRooms());
        existing.setAcAvailable(updated.getAcAvailable());
        return roomRepository.save(existing);
    }

    public void deleteRoom(Long roomId) {
        roomRepository.deleteById(roomId);
    }
}
