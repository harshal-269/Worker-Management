package com.localworker.backend.controller;

import com.localworker.backend.dto.WorkerResponseDTO;
import com.localworker.backend.model.Worker;
import com.localworker.backend.service.WorkerService;

import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/workers")
@Validated
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    // Create worker
    @PostMapping
    public Worker createWorker(@RequestBody Worker worker) {
        return workerService.createWorker(worker);
    }

    // Get all workers
    @GetMapping
    public List<WorkerResponseDTO> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    // Get worker by ID
    @GetMapping("/{id}")
    public WorkerResponseDTO getWorkerById(@PathVariable Long id) {
        return workerService.getWorkerById(id);
    }

    // Update worker
    @PutMapping("/{id}")
    public Worker updateWorker(
            @PathVariable Long id,
            @RequestBody Worker worker) {

        return workerService.updateWorker(id, worker);
    }

    // Delete worker
    @DeleteMapping("/{id}")
    public String deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return "Worker deleted successfully";
    }

    // Add services to a worker
    @PutMapping("/{workerId}/services")
    public Worker addServicesToWorker(
            @PathVariable Long workerId,
            @RequestBody Set<Long> serviceIds) {

        return workerService.addServicesToWorker(
                workerId,
                serviceIds
        );
    }

    // Search workers by name
    @GetMapping("/search")
    public Page<WorkerResponseDTO> searchWorkers(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.searchWorkersByName(
                name,
                page,
                size,
                sortBy,
                direction
        );
    }

    // Filter workers by location
    @GetMapping("/filter/location")
    public Page<WorkerResponseDTO> filterByLocation(
            @RequestParam String location,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByLocation(
                location,
                page,
                size,
                sortBy,
                direction
        );
    }

    // Filter workers by minimum experience
    @GetMapping("/filter/experience")
    public Page<WorkerResponseDTO> filterByExperience(
            @RequestParam int minExperience,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "experience") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {

        return workerService.filterWorkersByExperience(
                minExperience,
                page,
                size,
                sortBy,
                direction
        );
    }

    // Filter workers by availability
    @GetMapping("/filter/availability")
    public Page<WorkerResponseDTO> filterByAvailability(
            @RequestParam boolean available,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String direction) {

        return workerService.filterWorkersByAvailability(
                available,
                page,
                size,
                sortBy,
                direction
        );
    }
}