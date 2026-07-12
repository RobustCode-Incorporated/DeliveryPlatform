package com.robustcode.delivery.config;

import com.robustcode.delivery.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthenticationFilter;



    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }



    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();

    }



    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {


        return http

                .csrf(csrf -> csrf.disable())


                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                .authorizeHttpRequests(auth -> auth

                        // Auth public
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()


                        // Monitoring public
                        .requestMatchers(
                                "/actuator/**"
                        )
                        .permitAll()


                        // Administration globale
                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")


                        // Gestion restaurant personnel
                        .requestMatchers(
                                "/api/restaurants/me"
                        )
                        .hasRole("RESTAURANT")


                        // Administration restaurant globale
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/restaurants"
                        )
                        .hasRole("ADMIN")


                        // Gestion drivers
                        .requestMatchers(
                                "/api/drivers/**"
                        )
                        .hasAnyRole("ADMIN", "DRIVER")


                        // Livraisons
                        .requestMatchers(
                                "/api/deliveries/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "DISPATCHER",
                                "DRIVER",
                                "RESTAURANT"
                        )


                        // Création commande CUSTOMER
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/orders"
                        )
                        .hasRole("CUSTOMER")


                        // Commandes personnelles CUSTOMER
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/my-orders"
                        )
                        .hasRole("CUSTOMER")


                        // Commandes restaurant
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders/restaurant"
                        )
                        .hasRole("RESTAURANT")


                        // Administration commandes
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders"
                        )
                        .hasRole("ADMIN")


                        // Tout le reste nécessite JWT
                        .anyRequest()
                        .authenticated()

                )


                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )


                .build();

    }

}