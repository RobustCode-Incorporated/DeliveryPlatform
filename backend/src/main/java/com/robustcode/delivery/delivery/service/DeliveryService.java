package com.robustcode.delivery.delivery.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.robustcode.delivery.delivery.domain.Delivery;
import com.robustcode.delivery.delivery.dto.CreateDeliveryRequest;
import com.robustcode.delivery.delivery.repository.DeliveryRepository;
import com.robustcode.delivery.user.domain.User;
import com.robustcode.delivery.user.repository.UserRepository;
import com.robustcode.delivery.driver.domain.Driver;
import com.robustcode.delivery.driver.repository.DriverRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository repository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

    public List<Delivery> findAll() {
        return repository.findAll();
    }

    public Delivery findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
    }

    public Delivery create(CreateDeliveryRequest request) {

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (customer.getRole() != User.Role.CUSTOMER) {
            throw new RuntimeException("User is not a customer");
        }

        Delivery delivery = Delivery.builder()
                .customer(customer)
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .description(request.getDescription())
                .build();

        return repository.save(delivery);
    }

    public Delivery assignDriver(Long deliveryId, Long driverId) {

        Delivery delivery = repository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getDriver() != null) {
            throw new RuntimeException("Delivery already assigned");
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getAvailabilityStatus() != Driver.AvailabilityStatus.AVAILABLE) {
            throw new RuntimeException("Driver is not available");
        }

        delivery.setDriver(driver);
        delivery.setStatus(Delivery.Status.ASSIGNED);

        driver.setAvailabilityStatus(Driver.AvailabilityStatus.BUSY);

        return repository.save(delivery);
    }

    public Delivery pickupDelivery(Long deliveryId) {

        Delivery delivery = repository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != Delivery.Status.ASSIGNED) {
            throw new RuntimeException(
                    "Delivery must be ASSIGNED before pickup. Current status: "
                            + delivery.getStatus());
        }

        delivery.setStatus(Delivery.Status.PICKED_UP);

        return repository.save(delivery);
    }

    public Delivery startDelivery(Long deliveryId) {

        Delivery delivery = repository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != Delivery.Status.PICKED_UP) {
            throw new RuntimeException(
                    "Delivery must be PICKED_UP before starting transit. Current status: "
                            + delivery.getStatus());
        }

        delivery.setStatus(Delivery.Status.IN_TRANSIT);

        return repository.save(delivery);
    }

    public Delivery completeDelivery(Long deliveryId) {

        Delivery delivery = repository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != Delivery.Status.IN_TRANSIT) {
            throw new RuntimeException(
                    "Delivery must be IN_TRANSIT before completion. Current status: "
                            + delivery.getStatus());
        }

        delivery.setStatus(Delivery.Status.DELIVERED);

        if (delivery.getDriver() != null) {
            delivery.getDriver().setAvailabilityStatus(
                    Driver.AvailabilityStatus.AVAILABLE);
        }

        return repository.save(delivery);
    }
}