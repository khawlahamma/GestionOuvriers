-- HandyConnectPro Database Schema
-- Structure complète de la base de données



-- Création des types énumérés
CREATE TYPE user_role AS ENUM ('client', 'worker', 'admin');

CREATE TYPE intervention_status AS ENUM (
    'pending',
    'accepted',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
);

CREATE TYPE service_category AS ENUM (
    'plumbing',
    'electricity',
    'painting',
    'carpentry',
    'gardening',
    'cleaning',
    'renovation',
    'hvac'
);

CREATE TYPE urgency AS ENUM ('low', 'medium', 'high');

-- Création des tables
CREATE TABLE users (
    id VARCHAR PRIMARY KEY NOT NULL,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    password VARCHAR,
    role user_role DEFAULT 'client',
    city VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE worker_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category service_category NOT NULL,
    specializations TEXT[],
    experience INTEGER NOT NULL,
    skills TEXT[],
    certifications TEXT[],
    description TEXT,
    hourly_rate DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    phone_number VARCHAR,
    city TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_worker_profile UNIQUE (user_id)
);

CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category service_category NOT NULL,
    urgency urgency DEFAULT 'medium',
    preferred_date TIMESTAMP,
    estimated_duration INTEGER,
    max_budget DECIMAL(10,2),
    address VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    status intervention_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    intervention_id INTEGER NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    client_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    worker_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_moderated BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    intervention_id INTEGER NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    sender_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_favorite UNIQUE (client_id, worker_id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Création des index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_city ON users(city);

CREATE INDEX idx_worker_profiles_category ON worker_profiles(category);
CREATE INDEX idx_worker_profiles_city ON worker_profiles(city);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating);
CREATE INDEX idx_worker_profiles_availability ON worker_profiles(is_available);

CREATE INDEX idx_interventions_status ON interventions(status);
CREATE INDEX idx_interventions_category ON interventions(category);
CREATE INDEX idx_interventions_city ON interventions(city);
CREATE INDEX idx_interventions_client ON interventions(client_id);
CREATE INDEX idx_interventions_worker ON interventions(worker_id);
CREATE INDEX idx_interventions_dates ON interventions(preferred_date, created_at);

CREATE INDEX idx_reviews_worker ON reviews(worker_id);
CREATE INDEX idx_reviews_intervention ON reviews(intervention_id);
CREATE INDEX idx_reviews_moderation ON reviews(is_moderated, is_visible);

CREATE INDEX idx_messages_intervention ON messages(intervention_id);
CREATE INDEX idx_messages_participants ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_read ON messages(is_read);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Création des fonctions et triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at
    BEFORE UPDATE ON worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at
    BEFORE UPDATE ON interventions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE worker_profiles
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM reviews
            WHERE worker_id = NEW.worker_id
            AND is_visible = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE worker_id = NEW.worker_id
            AND is_visible = true
        )
    WHERE user_id = NEW.worker_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_worker_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_rating();

-- Création des vues utiles
CREATE OR REPLACE VIEW worker_stats AS
SELECT 
    w.id,
    w.user_id,
    w.category,
    w.specializations,
    w.experience,
    w.skills,
    w.certifications,
    w.description,
    w.hourly_rate,
    w.is_available,
    w.rating,
    w.total_reviews,
    w.phone_number,
    w.created_at,
    w.updated_at,
    u.first_name,
    u.last_name,
    u.city,
    COUNT(DISTINCT i.id) as total_interventions,
    COUNT(DISTINCT r.id) as review_count,
    AVG(r.rating) as average_rating
FROM worker_profiles w
JOIN users u ON w.user_id = u.id
LEFT JOIN interventions i ON w.user_id = i.worker_id
LEFT JOIN reviews r ON w.user_id = r.worker_id
GROUP BY w.id, u.id;

CREATE OR REPLACE VIEW active_interventions AS
SELECT 
    i.*,
    c.first_name as client_first_name,
    c.last_name as client_last_name,
    w.first_name as worker_first_name,
    w.last_name as worker_last_name
FROM interventions i
JOIN users c ON i.client_id = c.id
LEFT JOIN users w ON i.worker_id = w.id
WHERE i.status IN ('pending', 'accepted', 'in_progress'); 