
package com.localworker.backend.controller;

import com.localworker.backend.dto.WorkerResponseDTO;
import com.localworker.backend.dto.WorkerAvailabilityRequest;
import com.localworker.backend.dto.WorkerProfileUpdateRequest;
import com.localworker.backend.dto.WorkerServiceOfferingRequest;
import com.localworker.backend.dto.WorkerServiceOfferingResponse;

import com.localworker.backend.model.Worker;
import com.localworker.backend.model.Service;

import com.localworker.backend.service.WorkerService;
import com.localworker.backend.service.WorkerServiceOfferingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/workers")
@Validated
public class WorkerController {

    private final WorkerService workerService;
    private final WorkerServiceOfferingService offeringService;

    public WorkerController(
            WorkerService workerService,
            WorkerServiceOfferingService offeringService
    ) {
        this.workerService = workerService;
        this.offeringService = offeringService;
    }

    // ==================== AUTHENTICATION HELPER ====================

    private String getAuthenticatedEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required"
            );
        }

        return authentication.getName();
    }

    // ==================== WORKER CRUD ====================

    @PostMapping
    public Worker createWorker(@RequestBody Worker worker) {
        return workerService.createWorker(worker);
    }

    @GetMapping
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    @GetMapping("/me")
    public WorkerResponseDTO getCurrentWorker() {
        return workerService.getCurrentWorker(
                getAuthenticatedEmail()
        );
    }

    @PutMapping("/me/profile")
    public WorkerResponseDTO updateCurrentWorkerProfile(
            @Valid @RequestBody WorkerProfileUpdateRequest request) {

        return workerService.updateCurrentWorkerProfile(
                getAuthenticatedEmail(),
                request
        );
    }

    @PatchMapping("/me/availability")
    public WorkerResponseDTO updateCurrentWorkerAvailability(
            @Valid @RequestBody WorkerAvailabilityRequest request) {

        return workerService.updateCurrentWorkerAvailability(
                getAuthenticatedEmail(),
                request.available()
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

    // ==================== NEW SERVICE OFFERING + PRICING ====================

    @GetMapping("/me/offerings")
    public List<WorkerServiceOfferingResponse> getMyOfferings() {

        return offeringService.getMyOfferings(
                getAuthenticatedEmail()
        );
    }

    @PostMapping("/me/offerings")
    public WorkerServiceOfferingResponse addOffering(
            @Valid @RequestBody WorkerServiceOfferingRequest request) {

        return offeringService.addOffering(
                getAuthenticatedEmail(),
                request
        );
    }

    @PutMapping("/me/offerings/{serviceId}")
    public WorkerServiceOfferingResponse updateOfferingPrice(
            @PathVariable Long serviceId,
            @Valid @RequestBody WorkerServiceOfferingRequest request) {

        return offeringService.updateOfferingPrice(
                getAuthenticatedEmail(),
                serviceId,
                request
        );
    }

    @DeleteMapping("/me/offerings/{serviceId}")
    public String removeOffering(@PathVariable Long serviceId) {

        offeringService.removeOffering(
                getAuthenticatedEmail(),
                serviceId
        );

        return "Service offering removed successfully";
    }

    // ==================== OLD SERVICE ENDPOINTS ====================
    // Keep these temporarily while we migrate existing assignments.

    @GetMapping("/me/services")
    public Set<Service> getMyServices() {

        return workerService.getCurrentWorkerServices(
                getAuthenticatedEmail()
        );
    }

    @PostMapping("/me/services/{serviceId}")
    public Set<Service> addMyService(
            @PathVariable Long serviceId) {

        return workerService.addServiceToCurrentWorker(
                getAuthenticatedEmail(),
                serviceId
        );
    }

    @DeleteMapping("/me/services/{serviceId}")
    public Set<Service> removeMyService(
            @PathVariable Long serviceId) {

        return workerService.removeServiceFromCurrentWorker(
                getAuthenticatedEmail(),
                serviceId
        );
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

    // ==================== SEARCH ====================

    @GetMapping("/search")
    public Page<WorkerResponseDTO> searchWorkers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.searchWorkersByName(
                name, page, size, sortBy, direction
        );
    }

    @GetMapping("/filter/location")
    public Page<WorkerResponseDTO> filterByLocation(
            @RequestParam String location,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByLocation(
                location, page, size, sortBy, direction
        );
    }

    @GetMapping("/filter/experience")
    public Page<WorkerResponseDTO> filterByExperience(
            @RequestParam int minExperience,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "experience") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        return workerService.filterWorkersByExperience(
                minExperience, page, size, sortBy, direction
        );
    }

    @GetMapping("/filter/availability")
    public Page<WorkerResponseDTO> filterByAvailability(
            @RequestParam boolean available,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByAvailability(
                available, page, size, sortBy, direction
        );
    }
}
