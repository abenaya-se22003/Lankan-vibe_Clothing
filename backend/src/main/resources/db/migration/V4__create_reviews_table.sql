-- =============================================
-- V4: Create Reviews Table and Sample Data
-- =============================================

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT uq_product_user_review UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Sample reviews for seeded products
INSERT INTO reviews (product_id, user_id, rating, comment)
VALUES
(1, 1, 5, 'Superb quality batik shirt! The colors are bright and authentic handloom fabric feels very soft.'),
(2, 1, 5, 'Stunning silk dress with elegant drape. Got so many compliments wearing this to a garden wedding.'),
(3, 1, 4, 'Very comfortable cotton sarong with nice traditional borders. Great for daily wear.');
