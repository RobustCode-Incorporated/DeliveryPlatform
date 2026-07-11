package com.robustcode.delivery.vehicle.dto;

public record CreateVehicleRequest(

        String vehicleType,

        String plateNumber

) {}