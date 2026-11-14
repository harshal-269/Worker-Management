
package com.localworker.backend.repository;

import com.localworker.backend.model.WorkerServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerServiceOfferingRepository
        extends JpaRepository<WorkerServiceOffering, Long> {

    List<WorkerServiceOffering> findByWorker_IdAndActiveTrue(Long workerId);

    Optional<WorkerServiceOffering> findByWorker_IdAndService_Id(
            Long workerId,
            Long serviceId
    );

    boolean existsByWorker_IdAndService_Id(
            Long workerId,
            Long serviceId
    );

    void deleteByWorker_IdAndService_Id(
            Long workerId,
            Long serviceId
    );
}
