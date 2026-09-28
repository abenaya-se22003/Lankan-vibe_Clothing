-- =============================================
-- V2: Full Schema with Authentication & All Models
-- Drop old tables and rebuild with new structure
-- =============================================

-- Drop old tables (order matters due to foreign keys)
DROP TABLE IF EXISTS checkouts CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS subscribers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- Users Table (replaces customers, with roles)
-- =============================================
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(20),
    address      TEXT,
    city         VARCHAR(100),
    role         VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('CUSTOMER', 'ADMIN'))
);

-- =============================================
-- Products Table
-- =============================================
CREATE TABLE products (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL,
    description    TEXT,
    price          DECIMAL(10, 2) NOT NULL,
    category       VARCHAR(100),
    size           VARCHAR(20),
    color          VARCHAR(50),
    image_url      VARCHAR(500),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Cart Table (one cart per user)
-- =============================================
CREATE TABLE carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Cart Items Table
-- =============================================
CREATE TABLE cart_items (
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT chk_quantity CHECK (quantity > 0)
);

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE orders (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    total_amount     DECIMAL(10, 2) NOT NULL,
    status           VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    shipping_address TEXT,
    order_date       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
);

-- =============================================
-- Order Items Table
-- =============================================
CREATE TABLE order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  BIGINT NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    unit_price  DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- =============================================
-- Checkout Table (tracks checkout sessions)
-- =============================================
CREATE TABLE checkouts (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    order_id         BIGINT REFERENCES orders(id),
    shipping_address TEXT NOT NULL,
    payment_method   VARCHAR(50) NOT NULL DEFAULT 'COD',
    payment_status   VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount     DECIMAL(10, 2) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('COD', 'CARD', 'BANK_TRANSFER')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'))
);

-- =============================================
-- Subscribers Table (newsletter)
-- =============================================
CREATE TABLE subscribers (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Default Admin User (password: password123 - bcrypt encoded)
-- =============================================
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Admin', 'User', 'admin@lankanvibe.com',
        '$2a$10$XNB6e4Q6x57xFkX0jWv4fe3D2OIPCQdqgi5CO.wF1TuwBeK3.bI8q',
        'ADMIN');
