package com.robustcode.delivery.delivery.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.robustcode.delivery.delivery.domain.Delivery;

public interface DeliveryRepository 
        extends JpaRepository<Delivery, Long> {


}