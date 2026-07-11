package com.robustcode.delivery.driver.dto;

public record CreateDriverRequest(

        Long userId,

        String phoneNumber,

        String vehicleType,

        String vehiclePlate

) {}