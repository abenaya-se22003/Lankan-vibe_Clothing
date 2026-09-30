package com.lankanvibe.backend.dto;

public class CloudinaryAssetDto {

    private String publicId;
    private String url;
    private String secureUrl;
    private String format;
    private Integer width;
    private Integer height;
    private Long bytes;
    private String createdAt;

    public CloudinaryAssetDto() {}

    public CloudinaryAssetDto(String publicId, String url, String secureUrl, String format,
                              Integer width, Integer height, Long bytes, String createdAt) {
        this.publicId = publicId;
        this.url = url;
        this.secureUrl = secureUrl;
        this.format = format;
        this.width = width;
        this.height = height;
        this.bytes = bytes;
        this.createdAt = createdAt;
    }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSecureUrl() { return secureUrl; }
    public void setSecureUrl(String secureUrl) { this.secureUrl = secureUrl; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }

    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    public Long getBytes() { return bytes; }
    public void setBytes(Long bytes) { this.bytes = bytes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
