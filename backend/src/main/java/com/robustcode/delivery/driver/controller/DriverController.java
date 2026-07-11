package com.robustcode.delivery.driver.controller;

import com.robustcode.delivery.driver.dto.CreateDriverRequest;
import com.robustcode.delivery.driver.dto.DriverResponse;
import com.robustcode.delivery.driver.service.DriverService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/drivers")
public class DriverController {


    private final DriverService driverService;


    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }


    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(
            @RequestBody CreateDriverRequest request
    ) {

        return ResponseEntity.ok(
                driverService.createDriver(request)
        );
    }
}