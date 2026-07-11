package com.robustcode.delivery.vehicle.service;

import com.robustcode.delivery.vehicle.domain.Vehicle;
import com.robustcode.delivery.vehicle.dto.CreateVehicleRequest;
import com.robustcode.delivery.vehicle.dto.VehicleResponse;
import com.robustcode.delivery.vehicle.repository.VehicleRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {


    private final VehicleRepository vehicleRepository;


    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }


    public VehicleResponse createVehicle(CreateVehicleRequest request) {


        if (vehicleRepository.existsByPlateNumber(request.plateNumber())) {
            throw new RuntimeException("Vehicle plate already exists");
        }


        Vehicle vehicle = Vehicle.builder()
                .vehicleType(request.vehicleType())
                .plateNumber(request.plateNumber())
                .status(Vehicle.Status.AVAILABLE)
                .build();


        Vehicle savedVehicle = vehicleRepository.save(vehicle);


        return mapToResponse(savedVehicle);

    }


    public List<VehicleResponse> getAllVehicles() {

        return vehicleRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();

    }



    private VehicleResponse mapToResponse(Vehicle vehicle) {

        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getVehicleType(),
                vehicle.getPlateNumber(),
                vehicle.getStatus()
        );

    }

}