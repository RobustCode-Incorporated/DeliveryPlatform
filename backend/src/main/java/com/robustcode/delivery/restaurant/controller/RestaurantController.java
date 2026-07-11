package com.robustcode.delivery.restaurant.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.robustcode.delivery.restaurant.dto.CreateRestaurantRequest;
import com.robustcode.delivery.restaurant.dto.RestaurantResponse;
import com.robustcode.delivery.restaurant.service.RestaurantService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {


    private final RestaurantService service;



    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RestaurantResponse create(
            @Valid @RequestBody CreateRestaurantRequest request
    ){

        return service.createRestaurant(request);

    }



    @GetMapping
    public List<RestaurantResponse> findAll(){

        return service.findAll();

    }



    @GetMapping("/{id}")
    public RestaurantResponse findById(
            @PathVariable Long id
    ){

        return service.findById(id);

    }

}