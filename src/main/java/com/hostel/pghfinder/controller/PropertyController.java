package com.hostel.pghfinder.controller;

import com.hostel.pghfinder.dto.ApiResponse;
import com.hostel.pghfinder.entity.GenderType;
import com.hostel.pghfinder.entity.Property;
import com.hostel.pghfinder.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Property>>> getProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) GenderType genderType,
            @RequestParam(required = false) Double minRent,
            @RequestParam(required = false) Double maxRent,
            @RequestParam(required = false) String keyword
    ) {
        boolean hasFilter = (city != null && !city.trim().isEmpty())
                || genderType != null
                || minRent != null
                || maxRent != null
                || (keyword != null && !keyword.trim().isEmpty());

        List<Property> properties = hasFilter
                ? propertyService.searchProperties(city, genderType, minRent, maxRent, keyword)
                : propertyService.getAllActiveProperties();

        return ResponseEntity.ok(ApiResponse.success(properties));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Property>>> getAllPropertiesAdmin() {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getAllProperties()));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ApiResponse<Property>> getPropertyById(@PathVariable Long id) {
        try {
            Property property = propertyService.getPropertyById(id);
            return ResponseEntity.ok(ApiResponse.success(property));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<Property>>> getOwnerProperties(
            @PathVariable Long ownerId,
            @RequestParam(required = false) String ownerEmail) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.getPropertiesByOwner(ownerId, ownerEmail)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Property>> createProperty(
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String ownerEmail,
            @Valid @RequestBody Property property) {
        try {
            Property created = propertyService.createProperty(property, ownerId, ownerEmail);
            return ResponseEntity.ok(ApiResponse.success("Property created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Property>> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody Property property) {
        try {
            Property updated = propertyService.updateProperty(id, property);
            return ResponseEntity.ok(ApiResponse.success("Property updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<Property>> toggleVerification(@PathVariable Long id) {
        try {
            Property updated = propertyService.togglePropertyVerification(id);
            return ResponseEntity.ok(ApiResponse.success("Verification status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Property>> toggleStatus(@PathVariable Long id) {
        try {
            Property updated = propertyService.togglePropertyStatus(id);
            return ResponseEntity.ok(ApiResponse.success("Property status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        try {
            propertyService.deleteProperty(id);
            return ResponseEntity.ok(ApiResponse.success("Property deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePropertyGet(@PathVariable Long id) {
        try {
            propertyService.deleteProperty(id);
            return ResponseEntity.ok(ApiResponse.success("Property deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
