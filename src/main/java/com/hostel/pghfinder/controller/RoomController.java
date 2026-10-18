package com.hostel.pghfinder.controller;

import com.hostel.pghfinder.dto.ApiResponse;
import com.hostel.pghfinder.entity.Room;
import com.hostel.pghfinder.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    @Autowired
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<Room>>> getRoomsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomsByPropertyId(propertyId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Room>> getRoomById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<Room>> addRoom(
            @PathVariable Long propertyId,
            @Valid @RequestBody Room room) {
        try {
            Room created = roomService.addRoom(propertyId, room);
            return ResponseEntity.ok(ApiResponse.success("Room added successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Room>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody Room room) {
        try {
            Room updated = roomService.updateRoom(id, room);
            return ResponseEntity.ok(ApiResponse.success("Room updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
