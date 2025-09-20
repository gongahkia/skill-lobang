-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    skills_future_credits DECIMAL(10,2) DEFAULT 0,
    credit_expiry_date DATE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    accreditation TEXT[],
    specializations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    provider VARCHAR(255) NOT NULL,
    provider_id UUID REFERENCES providers(id),
    category VARCHAR(100),
    skill_area VARCHAR(100),
    duration INTEGER, -- in hours
    price_before_subsidy DECIMAL(10,2),
    price_after_subsidy DECIMAL(10,2),
    subsidy_percentage DECIMAL(5,2),
    available_seats INTEGER,
    total_seats INTEGER,
    start_date DATE,
    end_date DATE,
    registration_deadline DATE,
    frequency VARCHAR(50) CHECK (frequency IN ('weekday', 'weekend', 'evening', 'full-time', 'part-time')),
    mode VARCHAR(20) CHECK (mode IN ('online', 'in-person', 'hybrid')),
    location VARCHAR(255),
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    source_url VARCHAR(500),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    helpful INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved courses table
CREATE TABLE saved_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    notes TEXT,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Course alerts table
CREATE TABLE course_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) CHECK (alert_type IN ('registration_deadline', 'seats_available', 'price_drop')),
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraping jobs table
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
    courses_found INTEGER DEFAULT 0,
    courses_updated INTEGER DEFAULT 0,
    errors JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_provider ON courses(provider);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_skill_area ON courses(skill_area);
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_courses_price_after_subsidy ON courses(price_after_subsidy);
CREATE INDEX idx_courses_rating ON courses(id); -- Will be calculated from reviews
CREATE INDEX idx_reviews_course_id ON reviews(course_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_saved_courses_user_id ON saved_courses(user_id);
CREATE INDEX idx_course_alerts_user_id ON course_alerts(user_id);

-- Full text search indexes
CREATE INDEX idx_courses_title_search ON courses USING gin(to_tsvector('english', title));
CREATE INDEX idx_courses_description_search ON courses USING gin(to_tsvector('english', description));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate provider rating from reviews
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers
    SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE provider_id = COALESCE(NEW.provider_id, OLD.provider_id)
        )
    WHERE id = COALESCE(NEW.provider_id, OLD.provider_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update provider rating when reviews change
CREATE TRIGGER update_provider_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_rating();