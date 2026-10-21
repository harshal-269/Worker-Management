package com.localworker.backend.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final Path uploadDirectory;

    public FileStorageService(
            @Value("${app.file.upload-dir:uploads}") String uploadDirectory) {

        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not create upload directory", exception);
        }
    }

    public String storeFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image size cannot exceed 5 MB");
        }

        String contentType = file.getContentType();

        if (contentType == null) {
            throw new IllegalArgumentException(
                    "Image content type is required");
        }

        contentType = contentType.toLowerCase();

        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WebP images are allowed");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename());

        if (originalFilename.isBlank()
                || originalFilename.contains("..")) {
            throw new IllegalArgumentException(
                    "Invalid filename");
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Unsupported image type");
        };

        try {
            // Read the uploaded file into memory after checking its size.
            byte[] fileBytes = file.getBytes();

            // Validate the actual content, not only the Content-Type.
            validateImageContent(fileBytes, contentType);

            String filename = UUID.randomUUID() + extension;

            Path destination = uploadDirectory
                    .resolve(filename)
                    .normalize();

            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException(
                        "Invalid file path");
            }

            // Save only after validation succeeds.
            Files.write(destination, fileBytes);

            return filename;

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not store the image", exception);
        }
    }

    private void validateImageContent(
            byte[] bytes,
            String contentType) {

        boolean validSignature = switch (contentType) {

            case "image/jpeg" ->
                    bytes.length >= 3
                            && (bytes[0] & 0xFF) == 0xFF
                            && (bytes[1] & 0xFF) == 0xD8
                            && (bytes[2] & 0xFF) == 0xFF;

            case "image/png" ->
                    bytes.length >= 8
                            && (bytes[0] & 0xFF) == 0x89
                            && bytes[1] == 0x50
                            && bytes[2] == 0x4E
                            && bytes[3] == 0x47
                            && bytes[4] == 0x0D
                            && bytes[5] == 0x0A
                            && bytes[6] == 0x1A
                            && bytes[7] == 0x0A;

            case "image/webp" ->
                    bytes.length >= 12
                            && bytes[0] == 'R'
                            && bytes[1] == 'I'
                            && bytes[2] == 'F'
                            && bytes[3] == 'F'
                            && bytes[8] == 'W'
                            && bytes[9] == 'E'
                            && bytes[10] == 'B'
                            && bytes[11] == 'P';

            default -> false;
        };

        if (!validSignature) {
            throw new IllegalArgumentException(
                    "File content does not match the selected image type");
        }

        // Standard Java ImageIO can decode JPEG and PNG.
        // WebP decoding requires a compatible ImageIO plugin.
        if (contentType.equals("image/jpeg")
                || contentType.equals("image/png")) {

            try (ByteArrayInputStream inputStream =
                         new ByteArrayInputStream(bytes)) {

                BufferedImage image = ImageIO.read(inputStream);

                if (image == null) {
                    throw new IllegalArgumentException(
                            "Uploaded file is not a valid image");
                }

            } catch (IOException exception) {
                throw new IllegalArgumentException(
                        "Could not validate the image content",
                        exception);
            }
        }
    }

    public byte[] loadFile(String filename) {

        if (filename == null
                || !filename.matches(
                "[a-fA-F0-9-]{36}\\.(jpg|png|webp)")) {

            throw new IllegalArgumentException(
                    "Invalid filename");
        }

        Path filePath = uploadDirectory
                .resolve(filename)
                .normalize();

        if (!filePath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid file path");
        }

        try {
            if (!Files.exists(filePath)
                    || !Files.isRegularFile(filePath)) {

                throw new IllegalArgumentException(
                        "Image not found");
            }

            return Files.readAllBytes(filePath);

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not read the image", exception);
        }
    }
}