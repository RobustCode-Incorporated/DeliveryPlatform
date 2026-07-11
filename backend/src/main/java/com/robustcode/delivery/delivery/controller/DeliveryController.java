package com.robustcode.delivery.delivery.controller;


import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.robustcode.delivery.delivery.domain.Delivery;
import com.robustcode.delivery.delivery.dto.AssignDriverRequest;
import com.robustcode.delivery.delivery.dto.CreateDeliveryRequest;
import com.robustcode.delivery.delivery.service.DeliveryService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
public class DeliveryController {


    private final DeliveryService service;


    @GetMapping
    public List<Delivery> getAll(){

        return service.findAll();

    }


    @GetMapping("/{id}")
    public Delivery getById(
            @PathVariable Long id){

        return service.findById(id);

    }


    @PostMapping
    public Delivery create(
            @Valid @RequestBody CreateDeliveryRequest request){

        return service.create(request);

    }


    @PutMapping("/{id}/assign")
    public Delivery assignDriver(
            @PathVariable Long id,
            @RequestBody AssignDriverRequest request){

        return service.assignDriver(
                id,
                request.getDriverId()
        );

    }


    @PutMapping("/{id}/pickup")
    public Delivery pickupDelivery(
            @PathVariable Long id){

        return service.pickupDelivery(id);

    }


    @PutMapping("/{id}/start")
    public Delivery startDelivery(
            @PathVariable Long id){

        return service.startDelivery(id);

    }


    @PutMapping("/{id}/complete")
    public Delivery completeDelivery(
            @PathVariable Long id){

        return service.completeDelivery(id);

    }

}