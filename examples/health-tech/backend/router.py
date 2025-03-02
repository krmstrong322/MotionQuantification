from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import os
import json

from . import models
from .database import get_db

router = APIRouter()

# User endpoints
@router.post("/users/", response_model=models.UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: models.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In production, hash the password
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=user.password,  # Should be hashed
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users/", response_model=List[models.UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=models.UserResponse)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Patient endpoints
@router.post("/patients/", response_model=models.PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: models.PatientCreate, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.medical_id == patient.medical_id).first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Medical ID already registered")
    
    new_patient = models.Patient(**patient.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.get("/patients/", response_model=List[models.PatientResponse])
async def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@router.get("/patients/{patient_id}", response_model=models.PatientResponse)
async def read_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

# Motion data endpoints
@router.post("/motion-data/", response_model=models.MotionDataResponse)
async def create_motion_data(
    patient_id: int,
    movement_type: str,
    notes: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Save uploaded file
    file_location = f"data/motion/{patient_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Create motion data record
    motion_data = models.MotionData(
        patient_id=patient_id,
        movement_type=movement_type,
        data_file_path=file_location,
        notes=notes
    )
    
    db.add(motion_data)
    db.commit()
    db.refresh(motion_data)
    return motion_data

@router.get("/motion-data/patient/{patient_id}", response_model=List[models.MotionDataResponse])
async def get_patient_motion_data(patient_id: int, db: Session = Depends(get_db)):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    motion_data = db.query(models.MotionData).filter(models.MotionData.patient_id == patient_id).all()
    return motion_data

# Health metrics endpoints
@router.post("/health-metrics/", response_model=models.HealthMetricResponse)
async def create_health_metric(health_metric: models.HealthMetricCreate, db: Session = Depends(get_db)):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == health_metric.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    new_metric = models.HealthMetric(**health_metric.dict())
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/health-metrics/patient/{patient_id}", response_model=List[models.HealthMetricResponse])
async def get_patient_health_metrics(
    patient_id: int, 
    metric_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = db.query(models.HealthMetric).filter(models.HealthMetric.patient_id == patient_id)
    
    if metric_type:
        query = query.filter(models.HealthMetric.metric_type == metric_type)
    
    if start_date:
        query = query.filter(models.HealthMetric.recorded_at >= start_date)
    
    if end_date:
        query = query.filter(models.HealthMetric.recorded_at <= end_date)
    
    metrics = query.order_by(models.HealthMetric.recorded_at.desc()).all()
    return metrics

# Session endpoints
@router.post("/sessions/", response_model=models.SessionResponse)
async def create_session(session: models.SessionCreate, db: Session = Depends(get_db)):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == session.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify therapist exists
    therapist = db.query(models.User).filter(models.User.id == session.therapist_id).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    
    new_session = models.Session(**session.dict())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/sessions/patient/{patient_id}", response_model=List[models.SessionResponse])
async def get_patient_sessions(patient_id: int, db: Session = Depends(get_db)):
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sessions = db.query(models.Session).filter(models.Session.patient_id == patient_id).all()
    return sessions