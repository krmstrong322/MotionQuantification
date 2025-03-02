from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

from .database import Base

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    patients = relationship("Patient", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    medical_id = Column(String, unique=True, index=True)
    date_of_birth = Column(Date)
    gender = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    contact_phone = Column(String)
    emergency_contact = Column(String)
    created_at = Column(DateTime, default=func.now())
    
    user = relationship("User", back_populates="patients")
    motion_data = relationship("MotionData", back_populates="patient")
    health_metrics = relationship("HealthMetric", back_populates="patient")
    sessions = relationship("Session", back_populates="patient")

class MotionData(Base):
    __tablename__ = "motion_data"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    recording_date = Column(DateTime, default=func.now())
    movement_type = Column(String)
    data_file_path = Column(String)
    notes = Column(Text)
    
    patient = relationship("Patient", back_populates="motion_data")

class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    recorded_at = Column(DateTime, default=func.now())
    metric_type = Column(String)
    metric_value = Column(Float)
    unit = Column(String)
    notes = Column(Text)
    
    patient = relationship("Patient", back_populates="health_metrics")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    therapist_id = Column(Integer, ForeignKey("users.id"))
    session_date = Column(DateTime, default=func.now())
    session_type = Column(String)
    duration_minutes = Column(Integer)
    notes = Column(Text)
    status = Column(String, default="scheduled")
    
    patient = relationship("Patient", back_populates="sessions")
    therapist = relationship("User")

# Pydantic models for API
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class PatientBase(BaseModel):
    medical_id: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    contact_phone: Optional[str] = None
    emergency_contact: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: int

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class MotionDataBase(BaseModel):
    movement_type: str
    data_file_path: str
    notes: Optional[str] = None

class MotionDataCreate(MotionDataBase):
    patient_id: int

class MotionDataResponse(MotionDataBase):
    id: int
    recording_date: datetime
    
    class Config:
        orm_mode = True

class HealthMetricBase(BaseModel):
    metric_type: str
    metric_value: float
    unit: Optional[str] = None
    notes: Optional[str] = None

class HealthMetricCreate(HealthMetricBase):
    patient_id: int

class HealthMetricResponse(HealthMetricBase):
    id: int
    recorded_at: datetime
    
    class Config:
        orm_mode = True

class SessionBase(BaseModel):
    session_type: str
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    status: str = "scheduled"

class SessionCreate(SessionBase):
    patient_id: int
    therapist_id: int
    session_date: datetime

class SessionResponse(SessionBase):
    id: int
    patient_id: int
    therapist_id: int
    session_date: datetime
    
    class Config:
        orm_mode = True