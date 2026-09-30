package com.lankanvibe.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lankanvibe.backend.dto.CloudinaryAssetDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * CloudinaryService - Manages image uploads, deletions, and folder asset retrieval
 */
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder:samples/Lankan vibe}")
    private String defaultFolder;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String getDefaultFolder() {
        return defaultFolder;
    }

    /**
     * Upload an image file directly into the configured folder (e.g. samples/Lankan vibe)
     */
    public CloudinaryAssetDto uploadImage(MultipartFile file) throws IOException {
        return uploadImage(file, defaultFolder);
    }

    /**
     * Upload an image to a custom folder path in Cloudinary
     */
    public CloudinaryAssetDto uploadImage(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder != null && !folder.isBlank() ? folder : defaultFolder,
                "resource_type", "image"
        );

        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader()
                .upload(file.getBytes(), params);

        return mapToAssetDto(uploadResult);
    }

    /**
     * Delete an image from Cloudinary by its public ID
     */
    public Map<String, Object> deleteImage(String publicId) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) cloudinary.uploader()
                .destroy(publicId, ObjectUtils.emptyMap());
        return result;
    }

    /**
     * List all image assets currently stored in the default folder (samples/Lankan vibe)
     */
    public List<CloudinaryAssetDto> getFolderImages() throws Exception {
        return getFolderImages(defaultFolder);
    }

    /**
     * List all image assets stored in a specific Cloudinary asset folder
     */
    public List<CloudinaryAssetDto> getFolderImages(String folder) throws Exception {
        List<CloudinaryAssetDto> assets = new ArrayList<>();
        String targetFolder = folder != null && !folder.isBlank() ? folder : defaultFolder;

        try {
            // Use Admin API resourcesByAssetFolder (matches Cloudinary dynamic asset folders)
            Map<String, Object> params = ObjectUtils.asMap(
                    "max_results", 100
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> folderResult = (Map<String, Object>) cloudinary.api()
                    .resourcesByAssetFolder(targetFolder, params);

            if (folderResult.containsKey("resources")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> resources = (List<Map<String, Object>>) folderResult.get("resources");
                for (Map<String, Object> res : resources) {
                    assets.add(mapToAssetDto(res));
                }
                return assets;
            }
        } catch (Exception e) {
            // Fallback to Search API
            try {
                String expression = "asset_folder:\"" + targetFolder + "\"";
                @SuppressWarnings("unchecked")
                Map<String, Object> searchResult = (Map<String, Object>) cloudinary.search()
                        .expression(expression)
                        .maxResults(100)
                        .execute();

                if (searchResult.containsKey("resources")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> resources = (List<Map<String, Object>>) searchResult.get("resources");
                    for (Map<String, Object> res : resources) {
                        assets.add(mapToAssetDto(res));
                    }
                }
            } catch (Exception ex) {
                // Secondary fallback using prefix
                Map<String, Object> prefixParams = ObjectUtils.asMap(
                        "type", "upload",
                        "prefix", targetFolder + "/",
                        "max_results", 100
                );
                @SuppressWarnings("unchecked")
                Map<String, Object> adminResult = (Map<String, Object>) cloudinary.api().resources(prefixParams);
                if (adminResult.containsKey("resources")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> resources = (List<Map<String, Object>>) adminResult.get("resources");
                    for (Map<String, Object> res : resources) {
                        assets.add(mapToAssetDto(res));
                    }
                }
            }
        }

        return assets;
    }

    private CloudinaryAssetDto mapToAssetDto(Map<String, Object> data) {
        String publicId = (String) data.get("public_id");
        String url = (String) data.get("url");
        String secureUrl = (String) data.getOrDefault("secure_url", url);
        String format = (String) data.get("format");
        Integer width = data.get("width") instanceof Number ? ((Number) data.get("width")).intValue() : null;
        Integer height = data.get("height") instanceof Number ? ((Number) data.get("height")).intValue() : null;
        Long bytes = data.get("bytes") instanceof Number ? ((Number) data.get("bytes")).longValue() : null;
        String createdAt = String.valueOf(data.getOrDefault("created_at", ""));

        return new CloudinaryAssetDto(publicId, url, secureUrl, format, width, height, bytes, createdAt);
    }
}
