package com.lankanvibe.backend.controller;

import com.lankanvibe.backend.dto.CloudinaryAssetDto;
import com.lankanvibe.backend.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * CloudinaryController - REST endpoints for image management and Cloudinary folder assets
 */
@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    public CloudinaryController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    // GET /api/images - List all images in samples/Lankan vibe folder
    @GetMapping
    public ResponseEntity<List<CloudinaryAssetDto>> getFolderImages(
            @RequestParam(required = false) String folder) {
        try {
            List<CloudinaryAssetDto> images = folder != null && !folder.isBlank()
                    ? cloudinaryService.getFolderImages(folder)
                    : cloudinaryService.getFolderImages();
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST /api/images/upload - Upload an image to samples/Lankan vibe folder
    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {
        try {
            CloudinaryAssetDto uploaded = folder != null && !folder.isBlank()
                    ? cloudinaryService.uploadImage(file, folder)
                    : cloudinaryService.uploadImage(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Image upload failed: " + e.getMessage()));
        }
    }

    // DELETE /api/images - Delete an image by publicId
    @DeleteMapping
    public ResponseEntity<?> deleteImage(@RequestParam("publicId") String publicId) {
        try {
            Map<String, Object> result = cloudinaryService.deleteImage(publicId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete image: " + e.getMessage()));
        }
    }
}
