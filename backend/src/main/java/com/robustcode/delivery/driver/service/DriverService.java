package com.robustcode.delivery.driver.service;

import com.robustcode.delivery.driver.domain.Driver;
import com.robustcode.delivery.driver.dto.CreateDriverRequest;
import com.robustcode.delivery.driver.dto.DriverResponse;
import com.robustcode.delivery.driver.repository.DriverRepository;
import com.robustcode.delivery.user.domain.User;
import com.robustcode.delivery.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;


    public DriverService(
            DriverRepository driverRepository,
            UserRepository userRepository
    ) {
        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
    }


    public DriverResponse createDriver(CreateDriverRequest request) {

        User user = userRepository.findById(request.userId())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        if (user.getRole() != User.Role.DRIVER) {
            throw new RuntimeException(
                    "User role must be DRIVER"
            );
        }


        if (driverRepository.existsByUser(user)) {
            throw new RuntimeException(
                    "Driver profile already exists"
            );
        }


        Driver driver = Driver.builder()
                .user(user)
                .phoneNumber(request.phoneNumber())
                .vehicleType(request.vehicleType())
                .vehiclePlate(request.vehiclePlate())
                .availabilityStatus(
                        Driver.AvailabilityStatus.OFFLINE
                )
                .build();


        Driver savedDriver = driverRepository.save(driver);


        return mapToResponse(savedDriver);
    }


    private DriverResponse mapToResponse(Driver driver) {

        return new DriverResponse(
                driver.getId(),
                driver.getUser().getId(),
                driver.getPhoneNumber(),
                driver.getVehicleType(),
                driver.getVehiclePlate(),
                driver.getAvailabilityStatus()
        );
    }
}