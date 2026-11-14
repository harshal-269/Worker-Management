
package com.localworker.backend.service;

import com.localworker.backend.dto.WorkerServiceOfferingRequest;
import com.localworker.backend.dto.WorkerServiceOfferingResponse;
import com.localworker.backend.model.Service;
import com.localworker.backend.model.Worker;
import com.localworker.backend.model.WorkerServiceOffering;
import com.localworker.backend.repository.ServiceRepository;
import com.localworker.backend.repository.WorkerRepository;
import com.localworker.backend.repository.WorkerServiceOfferingRepository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class WorkerServiceOfferingService {

    private final WorkerServiceOfferingRepository offeringRepository;
    private final WorkerRepository workerRepository;
    private final ServiceRepository serviceRepository;

    public WorkerServiceOfferingService(
            WorkerServiceOfferingRepository offeringRepository,
            WorkerRepository workerRepository,
            ServiceRepository serviceRepository
    ) {
        this.offeringRepository = offeringRepository;
        this.workerRepository = workerRepository;
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkerServiceOfferingResponse> getMyOfferings(String email) {

        Worker worker = getWorker(email);

        return offeringRepository
                .findByWorker_IdAndActiveTrue(worker.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional
    public WorkerServiceOfferingResponse addOffering(
            String email,
            WorkerServiceOfferingRequest request
    ) {

        Worker worker = getWorker(email);

        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() ->
                        new RuntimeException("Service not found")
                );

        if (offeringRepository.existsByWorker_IdAndService_Id(
                worker.getId(), service.getId())) {

            throw new RuntimeException(
                    "You have already added this service"
            );
        }

        WorkerServiceOffering offering = new WorkerServiceOffering(
                worker,
                service,
                request.getPrice()
        );

        return convertToResponse(
                offeringRepository.save(offering)
        );
    }

    @Transactional
    public WorkerServiceOfferingResponse updateOfferingPrice(
            String email,
            Long serviceId,
            WorkerServiceOfferingRequest request
    ) {

        Worker worker = getWorker(email);

        WorkerServiceOffering offering = offeringRepository
                .findByWorker_IdAndService_Id(worker.getId(), serviceId)
                .orElseThrow(() ->
                        new RuntimeException("Service offering not found")
                );

        offering.setPrice(request.getPrice());
        offering.setActive(true);

        return convertToResponse(
                offeringRepository.save(offering)
        );
    }

    @Transactional
    public void removeOffering(String email, Long serviceId) {

        Worker worker = getWorker(email);

        WorkerServiceOffering offering = offeringRepository
                .findByWorker_IdAndService_Id(worker.getId(), serviceId)
                .orElseThrow(() ->
                        new RuntimeException("Service offering not found")
                );

        offering.setActive(false);

        offeringRepository.save(offering);
    }

    private Worker getWorker(String email) {

        return workerRepository.findByUser_Email(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Worker profile not found"
                        )
                );
    }

    private WorkerServiceOfferingResponse convertToResponse(
            WorkerServiceOffering offering
    ) {

        return new WorkerServiceOfferingResponse(
                offering.getId(),
                offering.getService().getId(),
                offering.getService().getName(),
                offering.getService().getDescription(),
                offering.getPrice(),
                offering.isActive()
        );
    }
}
