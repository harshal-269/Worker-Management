package com.localworker.backend.service;

import com.localworker.backend.dto.WorkerResponseDTO;
import com.localworker.backend.model.Service;
import com.localworker.backend.model.Worker;
import com.localworker.backend.repository.ServiceRepository;
import com.localworker.backend.repository.WorkerRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@org.springframework.stereotype.Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final ServiceRepository serviceRepository;

    public WorkerService(
            WorkerRepository workerRepository,
            ServiceRepository serviceRepository) {

        this.workerRepository = workerRepository;
        this.serviceRepository = serviceRepository;
    }

    // Create worker
    public Worker createWorker(Worker worker) {
        return workerRepository.save(worker);
    }

    // Get all workers as DTOs
    @Transactional(readOnly = true)
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Get worker by ID as DTO
    @Transactional(readOnly = true)
    public WorkerResponseDTO getWorkerById(Long id) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        return convertToDTO(worker);
    }

    // Update worker
    public Worker updateWorker(Long id, Worker updatedWorker) {

        Worker existingWorker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        existingWorker.setLocation(updatedWorker.getLocation());
        existingWorker.setExperience(updatedWorker.getExperience());
        existingWorker.setDescription(updatedWorker.getDescription());
        existingWorker.setAvailable(updatedWorker.isAvailable());
        existingWorker.setUser(updatedWorker.getUser());
        existingWorker.setServices(updatedWorker.getServices());

        // Preserve the existing profile image during ordinary updates.
        // Profile images should be changed through the image upload API.

        return workerRepository.save(existingWorker);
    }

    // Delete worker
    public void deleteWorker(Long id) {

        Worker existingWorker = workerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        workerRepository.delete(existingWorker);
    }

    // Add services to a worker
    public Worker addServicesToWorker(Long workerId, Set<Long> serviceIds) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        Set<Service> services = new HashSet<>(
                serviceRepository.findAllById(serviceIds)
        );

        worker.setServices(services);

        return workerRepository.save(worker);
    }

    // Search workers by name with pagination and sorting
    @Transactional(readOnly = true)
    public Page<WorkerResponseDTO> searchWorkersByName(
            String name,
            int page,
            int size,
            String sortBy,
            String direction) {

        validatePagination(page, size);

        Pageable pageable = createPageable(page, size, sortBy, direction);

        return workerRepository.searchByName(name, pageable)
                .map(this::convertToDTO);
    }

    // Filter workers by location
    @Transactional(readOnly = true)
    public Page<WorkerResponseDTO> filterWorkersByLocation(
            String location,
            int page,
            int size,
            String sortBy,
            String direction) {

        validatePagination(page, size);

        Pageable pageable = createPageable(page, size, sortBy, direction);

        return workerRepository.findByLocationContainingIgnoreCase(
                        location,
                        pageable
                )
                .map(this::convertToDTO);
    }

    // Filter workers by minimum experience
    @Transactional(readOnly = true)
    public Page<WorkerResponseDTO> filterWorkersByExperience(
            int experience,
            int page,
            int size,
            String sortBy,
            String direction) {

        validatePagination(page, size);

        if (experience < 0) {
            throw new IllegalArgumentException(
                    "Experience cannot be negative"
            );
        }

        Pageable pageable = createPageable(page, size, sortBy, direction);

        return workerRepository.findByExperienceGreaterThanEqual(
                        experience,
                        pageable
                )
                .map(this::convertToDTO);
    }

    // Filter workers by availability
    @Transactional(readOnly = true)
    public Page<WorkerResponseDTO> filterWorkersByAvailability(
            boolean available,
            int page,
            int size,
            String sortBy,
            String direction) {

        validatePagination(page, size);

        Pageable pageable = createPageable(page, size, sortBy, direction);

        return workerRepository.findByAvailable(available, pageable)
                .map(this::convertToDTO);
    }

    // Update a worker's profile image
    @Transactional
    public Worker updateWorkerProfileImage(Long workerId, String filename) {

        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        worker.setProfileImage(filename);

        return workerRepository.save(worker);
    }

    // Convert Worker entity to WorkerResponseDTO
    private WorkerResponseDTO convertToDTO(Worker worker) {

        String name = null;

        if (worker.getUser() != null) {
            name = worker.getUser().getName();
        }

        String imageUrl = null;

        if (worker.getProfileImage() != null
                && !worker.getProfileImage().isBlank()) {
            imageUrl = "/api/images/" + worker.getProfileImage();
        }

        return new WorkerResponseDTO(
                worker.getId(),
                name,
                worker.getLocation(),
                worker.getExperience(),
                worker.getDescription(),
                worker.isAvailable(),
                imageUrl
        );
    }

    // Create pagination and sorting configuration
    private Pageable createPageable(
            int page,
            int size,
            String sortBy,
            String direction) {

        Set<String> allowedSortFields = Set.of(
                "id",
                "location",
                "experience",
                "available"
        );

        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid sort field. Allowed fields: id, location, experience, available"
            );
        }

        Sort.Direction sortDirection;

        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid sort direction. Use ASC or DESC"
            );
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );
    }

    // Validate pagination inputs
    private void validatePagination(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100"
            );
        }
    }


    @Transactional(readOnly = true)
    public Worker getWorkerEntityById(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));
    }
}