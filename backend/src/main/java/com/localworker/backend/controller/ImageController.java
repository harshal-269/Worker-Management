package com.localworker.backend.controller;

import com.localworker.backend.model.Worker;
import com.localworker.backend.service.WorkerService;
import com.localworker.backend.storage.FileStorageService;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final FileStorageService fileStorageService;
    private final WorkerService workerService;

    public ImageController(
            FileStorageService fileStorageService,
            WorkerService workerService) {

        this.fileStorageService = fileStorageService;
        this.workerService = workerService;
    }

    // Upload an image for the authenticated worker
    // ADMIN can update any worker's image
    @PostMapping(
            value = "/upload/worker/{workerId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadWorkerImage(
            @PathVariable Long workerId,
            @RequestParam("file") MultipartFile file) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Authentication required");
        }

        String email = authentication.getName();

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));

        Worker existingWorker = workerService.getWorkerEntityById(workerId);

        boolean isOwner = existingWorker.getUser() != null
                && email.equals(existingWorker.getUser().getEmail());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "You can only update your own profile image");
        }

        String filename = fileStorageService.storeFile(file);

        Worker worker = workerService.updateWorkerProfileImage(
                workerId, filename);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Worker profile image uploaded successfully");
        response.put("workerId", worker.getId());
        response.put("filename", filename);
        response.put("imageUrl", "/api/images/" + filename);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Retrieve an uploaded image
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getImage(
            @PathVariable String filename) {

        byte[] image = fileStorageService.loadFile(filename);

        MediaType mediaType;

        if (filename.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (filename.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else {
            mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)))
                .body(image);
    }
}