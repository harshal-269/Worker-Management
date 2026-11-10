package com.localworker.backend.controller;

import com.localworker.backend.dto.WorkerResponseDTO;
import com.localworker.backend.dto.WorkerAvailabilityRequest;
import com.localworker.backend.model.Worker;
import com.localworker.backend.service.WorkerService;

import com.localworker.backend.model.Service;

import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Set;
import com.localworker.backend.dto.WorkerProfileUpdateRequest;

@RestController
@RequestMapping("/api/workers")
@Validated
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    public Worker createWorker(@RequestBody Worker worker) {
        return workerService.createWorker(worker);
    }

    @GetMapping
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    // Must be declared before /{id}.
    @GetMapping("/me")
    public WorkerResponseDTO getCurrentWorker() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required");
        }

        return workerService.getCurrentWorker(
                authentication.getName()
        );
    }

    @PutMapping("/me/profile")
    public WorkerResponseDTO updateCurrentWorkerProfile(
            @Valid @RequestBody WorkerProfileUpdateRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required");
        }

        return workerService.updateCurrentWorkerProfile(
                authentication.getName(),
                request
        );
    }

    @PatchMapping("/me/availability")
    public WorkerResponseDTO updateCurrentWorkerAvailability(
            @Valid @RequestBody WorkerAvailabilityRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Authentication is required");
        }

        return workerService.updateCurrentWorkerAvailability(
                authentication.getName(),
                request.available()
        );
    }


    @GetMapping("/me/services")
    public Set<Service> getMyServices() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return workerService.getCurrentWorkerServices(
                authentication.getName()
        );
    }

    @PostMapping("/me/services/{serviceId}")
    public Set<Service> addMyService(
            @PathVariable Long serviceId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return workerService.addServiceToCurrentWorker(
                authentication.getName(),
                serviceId
        );
    }

    @DeleteMapping("/me/services/{serviceId}")
    public Set<Service> removeMyService(
            @PathVariable Long serviceId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return workerService.removeServiceFromCurrentWorker(
                authentication.getName(),
                serviceId
        );
    }

    @GetMapping("/{id}")
    public WorkerResponseDTO getWorkerById(@PathVariable Long id) {
        return workerService.getWorkerById(id);
    }

    @PutMapping("/{id}")
    public Worker updateWorker(
            @PathVariable Long id,
            @RequestBody Worker worker) {

        return workerService.updateWorker(id, worker);
    }

    @DeleteMapping("/{id}")
    public String deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return "Worker deleted successfully";
    }

    @PutMapping("/{workerId}/services")
    public Worker addServicesToWorker(
            @PathVariable Long workerId,
            @RequestBody Set<Long> serviceIds) {

        return workerService.addServicesToWorker(
                workerId,
                serviceIds
        );
    }

    @GetMapping("/search")
    public Page<WorkerResponseDTO> searchWorkers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.searchWorkersByName(
                name, page, size, sortBy, direction);
    }

    @GetMapping("/filter/location")
    public Page<WorkerResponseDTO> filterByLocation(
            @RequestParam String location,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByLocation(
                location, page, size, sortBy, direction);
    }

    @GetMapping("/filter/experience")
    public Page<WorkerResponseDTO> filterByExperience(
            @RequestParam int minExperience,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "experience") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        return workerService.filterWorkersByExperience(
                minExperience, page, size, sortBy, direction);
    }

    @GetMapping("/filter/availability")
    public Page<WorkerResponseDTO> filterByAvailability(
            @RequestParam boolean available,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByAvailability(
                available, page, size, sortBy, direction);
    }
}