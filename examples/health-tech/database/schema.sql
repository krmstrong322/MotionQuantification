-- Database schema for health-tech remote monitoring

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(200) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    medical_id VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm FLOAT,
    weight_kg FLOAT,
    contact_phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS motion_data (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    recording_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    movement_type VARCHAR(50),
    data_file_path VARCHAR(200),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS health_metrics (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR(50) NOT NULL,
    metric_value FLOAT NOT NULL,
    unit VARCHAR(20),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    therapist_id INTEGER REFERENCES users(id),
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_type VARCHAR(50),
    duration_minutes INTEGER,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled'
);