package com.robustcode.delivery.order.service;


import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.robustcode.delivery.driver.domain.Driver;
import com.robustcode.delivery.driver.repository.DriverRepository;
import com.robustcode.delivery.order.domain.Order;
import com.robustcode.delivery.order.domain.OrderStatusHistory;
import com.robustcode.delivery.order.dto.CreateOrderRequest;
import com.robustcode.delivery.order.dto.OrderResponse;
import com.robustcode.delivery.order.repository.OrderRepository;
import com.robustcode.delivery.order.repository.OrderStatusHistoryRepository;
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

    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    private final RestaurantRepository restaurantRepository;

    private final UserRepository userRepository;

    private final DriverRepository driverRepository;



    public OrderResponse createOrder(
            CreateOrderRequest request,
            String customerEmail
    ){

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );


        Restaurant restaurant =
                restaurantRepository.findById(request.restaurantId())

                .orElseThrow(() ->
                        new RuntimeException("Restaurant not found")
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


        Order savedOrder =
                orderRepository.save(order);



        saveHistory(
                savedOrder,
                null,
                Order.Status.PENDING,
                customerEmail
        );


        return OrderResponse.from(savedOrder);

    }




    public OrderResponse updateStatus(
            Long orderId,
            Order.Status newStatus,
            String email
    ){

        Order order =
                orderRepository.findById(orderId)

                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );


        Order.Status oldStatus =
                order.getStatus();


        order.setStatus(newStatus);


        Order savedOrder =
                orderRepository.save(order);



        saveHistory(
                savedOrder,
                oldStatus,
                newStatus,
                email
        );


        return OrderResponse.from(savedOrder);

    }




    public OrderResponse acceptOrder(
            Long orderId,
            String email
    ){

        return updateStatus(
                orderId,
                Order.Status.ACCEPTED,
                email
        );

    }




    public OrderResponse startPreparing(
            Long orderId,
            String email
    ){

        return updateStatus(
                orderId,
                Order.Status.PREPARING,
                email
        );

    }




    public OrderResponse readyForPickup(
            Long orderId,
            String email
    ){

        return updateStatus(
                orderId,
                Order.Status.READY_FOR_PICKUP,
                email
        );

    }




    public OrderResponse pickupOrder(
            Long orderId,
            String email
    ){

        return updateStatus(
                orderId,
                Order.Status.PICKED_UP,
                email
        );

    }




    public OrderResponse deliverOrder(
            Long orderId,
            String email
    ){

        return updateStatus(
                orderId,
                Order.Status.DELIVERED,
                email
        );

    }




    /**
     * ADMIN assigns driver to order
     */
    public OrderResponse assignDriver(
            Long orderId,
            Long driverId
    ){

        Order order =
                orderRepository.findById(orderId)

                .orElseThrow(() ->
                        new RuntimeException("Order not found")
                );


        Driver driver =
                driverRepository.findById(driverId)

                .orElseThrow(() ->
                        new RuntimeException("Driver not found")
                );


        order.setDriver(driver);


        Order savedOrder =
                orderRepository.save(order);



        return OrderResponse.from(savedOrder);

    }




    private void saveHistory(
            Order order,
            Order.Status oldStatus,
            Order.Status newStatus,
            String changedBy
    ){


        OrderStatusHistory history =
                OrderStatusHistory.builder()

                .order(order)

                .oldStatus(oldStatus)

                .newStatus(newStatus)

                .changedBy(changedBy)

                .build();



        orderStatusHistoryRepository.save(history);

    }





    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(
            String email
    ){

        User customer =
                userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
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

        User user =
                userRepository.findByEmail(email)

                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        Restaurant restaurant =
                user.getRestaurant();



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