package com.localworker.backend.dto;

public class WorkerResponseDTO {

    private Long id;
    private String name;
    private String location;
    private int experience;
    private String description;
    private boolean available;
    private String profileImage;

    public WorkerResponseDTO() {
    }

    public WorkerResponseDTO(
            Long id,
            String name,
            String location,
            int experience,
            String description,
            boolean available,
            String profileImage
    ) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.experience = experience;
        this.description = description;
        this.available = available;
        this.profileImage = profileImage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getExperience() {
        return experience;
    }

    public void setExperience(int experience) {
        this.experience = experience;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}