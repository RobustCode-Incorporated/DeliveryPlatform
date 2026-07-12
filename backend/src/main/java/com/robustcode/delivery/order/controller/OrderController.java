package com.robustcode.delivery.order.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.robustcode.delivery.order.dto.CreateOrderRequest;
import com.robustcode.delivery.order.dto.OrderResponse;
import com.robustcode.delivery.order.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {


    private final OrderService orderService;



    /**
     * CUSTOMER creates an order
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication
    ){

        return orderService.createOrder(
                request,
                authentication.getName()
        );

    }



    /**
     * CUSTOMER sees his own orders
     */
    @GetMapping("/my-orders")
    public List<OrderResponse> getMyOrders(
            Authentication authentication
    ){

        return orderService.getMyOrders(
                authentication.getName()
        );

    }



    /**
     * RESTAURANT sees orders assigned to his restaurant
     */
    @GetMapping("/restaurant")
    public List<OrderResponse> getRestaurantOrders(
            Authentication authentication
    ){

        return orderService.getRestaurantOrders(
                authentication.getName()
        );

    }



    /**
     * ADMIN sees all orders
     */
    @GetMapping
    public List<OrderResponse> findAll(){

        return orderService.findAll();

    }

}