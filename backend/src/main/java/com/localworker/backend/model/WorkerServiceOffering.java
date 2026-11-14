
package com.localworker.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
        name = "worker_service_offerings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_worker_service_offering",
                        columnNames = {"worker_id", "service_id"}
                )
        }
)
public class WorkerServiceOffering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean active = true;

    public WorkerServiceOffering() {
    }

    public WorkerServiceOffering(
            Worker worker,
            Service service,
            BigDecimal price
    ) {
        this.worker = worker;
        this.service = service;
        this.price = price;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Worker getWorker() {
        return worker;
    }

    public void setWorker(Worker worker) {
        this.worker = worker;
    }

    public Service getService() {
        return service;
    }

    public void setService(Service service) {
        this.service = service;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
