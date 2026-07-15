DO $$
DECLARE
    v_password_hash TEXT := '$2y$10$ERR7izVduprY5SkhjUC5SO/fofoKmumIyhPys.fzAScg12zqEvJtW';
    v_restaurant_id BIGINT;
    v_driver_id BIGINT;
    v_customer_a_id BIGINT;
    v_customer_b_id BIGINT;
    v_customer_c_id BIGINT;
    v_order_assigned_id BIGINT;
    v_order_pickup_id BIGINT;
    v_order_transit_id BIGINT;
BEGIN
    SELECT id INTO v_restaurant_id
    FROM restaurants
    WHERE email = 'manager@harborbowl.test';

    IF v_restaurant_id IS NULL THEN
        RAISE EXCEPTION 'Missing seeded restaurant manager@harborbowl.test';
    END IF;

    SELECT d.id INTO v_driver_id
    FROM users u
    JOIN drivers d ON d.user_id = u.id
    WHERE u.email = 'driver@test.com';

    IF v_driver_id IS NULL THEN
        RAISE EXCEPTION 'Missing seeded driver driver@test.com';
    END IF;

    INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        role,
        enabled,
        restaurant_id,
        created_at,
        updated_at
    ) VALUES
        ('lea.customer@test.com', v_password_hash, 'Lea', 'Martin', 'CUSTOMER', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('sam.customer@test.com', v_password_hash, 'Sam', 'Dupont', 'CUSTOMER', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('ines.customer@test.com', v_password_hash, 'Ines', 'Diallo', 'CUSTOMER', TRUE, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO UPDATE
    SET password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        enabled = EXCLUDED.enabled,
        restaurant_id = NULL,
        updated_at = CURRENT_TIMESTAMP;

    SELECT id INTO v_customer_a_id FROM users WHERE email = 'lea.customer@test.com';
    SELECT id INTO v_customer_b_id FROM users WHERE email = 'sam.customer@test.com';
    SELECT id INTO v_customer_c_id FROM users WHERE email = 'ines.customer@test.com';

    UPDATE orders
    SET customer_id = v_customer_a_id,
        restaurant_id = v_restaurant_id,
        driver_id = v_driver_id,
        status = 'READY_FOR_PICKUP',
        total_price = 28.50,
        created_at = CURRENT_TIMESTAMP - INTERVAL '45 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '20 minutes'
    WHERE delivery_address = 'QA MOBILE - 12 Rue des Fleurs, Paris';

    IF NOT FOUND THEN
        INSERT INTO orders (
            customer_id,
            restaurant_id,
            driver_id,
            status,
            total_price,
            delivery_address,
            created_at,
            updated_at
        ) VALUES (
            v_customer_a_id,
            v_restaurant_id,
            v_driver_id,
            'READY_FOR_PICKUP',
            28.50,
            'QA MOBILE - 12 Rue des Fleurs, Paris',
            CURRENT_TIMESTAMP - INTERVAL '45 minutes',
            CURRENT_TIMESTAMP - INTERVAL '20 minutes'
        );
    END IF;

    UPDATE orders
    SET customer_id = v_customer_b_id,
        restaurant_id = v_restaurant_id,
        driver_id = v_driver_id,
        status = 'PICKED_UP',
        total_price = 34.90,
        created_at = CURRENT_TIMESTAMP - INTERVAL '70 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '12 minutes'
    WHERE delivery_address = 'QA MOBILE - 8 Avenue Victor Hugo, Paris';

    IF NOT FOUND THEN
        INSERT INTO orders (
            customer_id,
            restaurant_id,
            driver_id,
            status,
            total_price,
            delivery_address,
            created_at,
            updated_at
        ) VALUES (
            v_customer_b_id,
            v_restaurant_id,
            v_driver_id,
            'PICKED_UP',
            34.90,
            'QA MOBILE - 8 Avenue Victor Hugo, Paris',
            CURRENT_TIMESTAMP - INTERVAL '70 minutes',
            CURRENT_TIMESTAMP - INTERVAL '12 minutes'
        );
    END IF;

    UPDATE orders
    SET customer_id = v_customer_c_id,
        restaurant_id = v_restaurant_id,
        driver_id = v_driver_id,
        status = 'PICKED_UP',
        total_price = 19.40,
        created_at = CURRENT_TIMESTAMP - INTERVAL '95 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    WHERE delivery_address = 'QA MOBILE - 44 Boulevard Saint-Germain, Paris';

    IF NOT FOUND THEN
        INSERT INTO orders (
            customer_id,
            restaurant_id,
            driver_id,
            status,
            total_price,
            delivery_address,
            created_at,
            updated_at
        ) VALUES (
            v_customer_c_id,
            v_restaurant_id,
            v_driver_id,
            'PICKED_UP',
            19.40,
            'QA MOBILE - 44 Boulevard Saint-Germain, Paris',
            CURRENT_TIMESTAMP - INTERVAL '95 minutes',
            CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        );
    END IF;

    SELECT id INTO v_order_assigned_id
    FROM orders
    WHERE delivery_address = 'QA MOBILE - 12 Rue des Fleurs, Paris';

    SELECT id INTO v_order_pickup_id
    FROM orders
    WHERE delivery_address = 'QA MOBILE - 8 Avenue Victor Hugo, Paris';

    SELECT id INTO v_order_transit_id
    FROM orders
    WHERE delivery_address = 'QA MOBILE - 44 Boulevard Saint-Germain, Paris';

    DELETE FROM order_status_history
    WHERE order_id IN (v_order_assigned_id, v_order_pickup_id, v_order_transit_id);

    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, created_at) VALUES
        (v_order_assigned_id, 'PENDING', 'ACCEPTED', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '40 minutes'),
        (v_order_assigned_id, 'ACCEPTED', 'READY_FOR_PICKUP', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '22 minutes'),
        (v_order_pickup_id, 'PENDING', 'ACCEPTED', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '60 minutes'),
        (v_order_pickup_id, 'ACCEPTED', 'READY_FOR_PICKUP', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '35 minutes'),
        (v_order_pickup_id, 'READY_FOR_PICKUP', 'PICKED_UP', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '12 minutes'),
        (v_order_transit_id, 'PENDING', 'ACCEPTED', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '85 minutes'),
        (v_order_transit_id, 'ACCEPTED', 'READY_FOR_PICKUP', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '50 minutes'),
        (v_order_transit_id, 'READY_FOR_PICKUP', 'PICKED_UP', 'qa-reset', CURRENT_TIMESTAMP - INTERVAL '18 minutes');

    UPDATE deliveries
    SET customer_id = v_customer_a_id,
        driver_id = v_driver_id,
        restaurant_id = v_restaurant_id,
        pickup_address = '18 Quai des Saveurs, Paris',
        description = 'QA mobile assigned workflow - freshly prepared bowl menu.',
        status = 'ASSIGNED',
        price = 28.50,
        created_at = CURRENT_TIMESTAMP - INTERVAL '45 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '20 minutes'
    WHERE delivery_address = 'QA MOBILE - 12 Rue des Fleurs, Paris';

    IF NOT FOUND THEN
        INSERT INTO deliveries (
            customer_id,
            driver_id,
            restaurant_id,
            pickup_address,
            delivery_address,
            description,
            status,
            price,
            created_at,
            updated_at
        ) VALUES (
            v_customer_a_id,
            v_driver_id,
            v_restaurant_id,
            '18 Quai des Saveurs, Paris',
            'QA MOBILE - 12 Rue des Fleurs, Paris',
            'QA mobile assigned workflow - freshly prepared bowl menu.',
            'ASSIGNED',
            28.50,
            CURRENT_TIMESTAMP - INTERVAL '45 minutes',
            CURRENT_TIMESTAMP - INTERVAL '20 minutes'
        );
    END IF;

    UPDATE deliveries
    SET customer_id = v_customer_b_id,
        driver_id = v_driver_id,
        restaurant_id = v_restaurant_id,
        pickup_address = '18 Quai des Saveurs, Paris',
        description = 'QA mobile pickup workflow - ready for start transition.',
        status = 'PICKED_UP',
        price = 34.90,
        created_at = CURRENT_TIMESTAMP - INTERVAL '70 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '12 minutes'
    WHERE delivery_address = 'QA MOBILE - 8 Avenue Victor Hugo, Paris';

    IF NOT FOUND THEN
        INSERT INTO deliveries (
            customer_id,
            driver_id,
            restaurant_id,
            pickup_address,
            delivery_address,
            description,
            status,
            price,
            created_at,
            updated_at
        ) VALUES (
            v_customer_b_id,
            v_driver_id,
            v_restaurant_id,
            '18 Quai des Saveurs, Paris',
            'QA MOBILE - 8 Avenue Victor Hugo, Paris',
            'QA mobile pickup workflow - ready for start transition.',
            'PICKED_UP',
            34.90,
            CURRENT_TIMESTAMP - INTERVAL '70 minutes',
            CURRENT_TIMESTAMP - INTERVAL '12 minutes'
        );
    END IF;

    UPDATE deliveries
    SET customer_id = v_customer_c_id,
        driver_id = v_driver_id,
        restaurant_id = v_restaurant_id,
        pickup_address = '18 Quai des Saveurs, Paris',
        description = 'QA mobile transit workflow - should complete from the app.',
        status = 'IN_TRANSIT',
        price = 19.40,
        created_at = CURRENT_TIMESTAMP - INTERVAL '95 minutes',
        updated_at = CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    WHERE delivery_address = 'QA MOBILE - 44 Boulevard Saint-Germain, Paris';

    IF NOT FOUND THEN
        INSERT INTO deliveries (
            customer_id,
            driver_id,
            restaurant_id,
            pickup_address,
            delivery_address,
            description,
            status,
            price,
            created_at,
            updated_at
        ) VALUES (
            v_customer_c_id,
            v_driver_id,
            v_restaurant_id,
            '18 Quai des Saveurs, Paris',
            'QA MOBILE - 44 Boulevard Saint-Germain, Paris',
            'QA mobile transit workflow - should complete from the app.',
            'IN_TRANSIT',
            19.40,
            CURRENT_TIMESTAMP - INTERVAL '95 minutes',
            CURRENT_TIMESTAMP - INTERVAL '5 minutes'
        );
    END IF;

    UPDATE drivers
    SET availability_status = 'BUSY',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_driver_id;
END $$;
