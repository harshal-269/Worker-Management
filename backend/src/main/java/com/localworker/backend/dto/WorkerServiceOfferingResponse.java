
package com.localworker.backend.dto;

import java.math.BigDecimal;

public class WorkerServiceOfferingResponse {

    private Long id;
    private Long serviceId;
    private String serviceName;
    private String serviceDescription;
    private BigDecimal price;
    private boolean active;

    public WorkerServiceOfferingResponse() {
    }

    public WorkerServiceOfferingResponse(
            Long id,
            Long serviceId,
            String serviceName,
            String serviceDescription,
            BigDecimal price,
            boolean active
    ) {
        this.id = id;
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.serviceDescription = serviceDescription;
        this.price = price;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public boolean isActive() {
        return active;
    }
}
