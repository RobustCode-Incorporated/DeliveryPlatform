package com.robustcode.delivery.order.service;


import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.robustcode.delivery.order.domain.Order;
import com.robustcode.delivery.order.dto.CreateOrderRequest;
import com.robustcode.delivery.order.dto.OrderResponse;
import com.robustcode.delivery.order.repository.OrderRepository;
import com.robustcode.delivery.restaurant.domain.Restaurant;
import com.robustcode.delivery.restaurant.repository.RestaurantRepository;
import com.robustcode.delivery.user.domain.User;
import com.robustcode.delivery.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {


    private final OrderRepository orderRepository;

    private final RestaurantRepository restaurantRepository;

    private final UserRepository userRepository;



    public OrderResponse createOrder(
            CreateOrderRequest request,
            String customerEmail
    ){


        User customer = userRepository.findByEmail(customerEmail)

                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        )
                );



        Restaurant restaurant =
                restaurantRepository.findById(
                        request.restaurantId()
                )

                .orElseThrow(() ->
                        new RuntimeException(
                                "Restaurant not found"
                        )
                );



        Order order = Order.builder()

                .customer(customer)

                .restaurant(restaurant)

                .status(Order.Status.PENDING)

                .totalPrice(
                        request.totalPrice()
                )

                .deliveryAddress(
                        request.deliveryAddress()
                )

                .build();



        return OrderResponse.from(
                orderRepository.save(order)
        );

    }




    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(
            String email
    ){

        User customer = userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        return orderRepository.findByCustomer(customer)

                .stream()

                .map(OrderResponse::from)

                .toList();

    }




    @Transactional(readOnly = true)
    public List<OrderResponse> getRestaurantOrders(
            String email
    ){

        User user = userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );


        Restaurant restaurant = user.getRestaurant();


        if(restaurant == null){

            throw new RuntimeException(
                    "Restaurant not assigned"
            );

        }


        return orderRepository.findByRestaurant(restaurant)

                .stream()

                .map(OrderResponse::from)

                .toList();

    }




    @Transactional(readOnly = true)
    public List<OrderResponse> findAll(){

        return orderRepository.findAll()

                .stream()

                .map(OrderResponse::from)

                .toList();

    }

}