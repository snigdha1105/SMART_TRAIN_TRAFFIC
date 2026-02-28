from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, Station, Train, Schedule, Section, Delay, create_tables
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Train Traffic Control System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

# ─── Database Dependency ───────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Pydantic Schemas (Request Body Models) ────────────────────
class StationCreate(BaseModel):
    name: str
    code: str
    city: str

class TrainCreate(BaseModel):
    train_number: str
    name: str
    type: str

class ScheduleCreate(BaseModel):
    train_id: int
    station_id: int
    arrival_time: str
    departure_time: str
    day: int
    sequence: int


# ─── Station Routes ────────────────────────────────────────────
@app.post("/stations/")
def add_station(station: StationCreate, db: Session = Depends(get_db)):
    existing = db.query(Station).filter(Station.code == station.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Station code already exists")
    new_station = Station(**station.dict())
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return {"message": "Station added successfully", "station": new_station.name}

@app.get("/stations/")
def get_stations(db: Session = Depends(get_db)):
    stations = db.query(Station).all()
    return stations


# ─── Train Routes ──────────────────────────────────────────────
@app.post("/trains/")
def add_train(train: TrainCreate, db: Session = Depends(get_db)):
    existing = db.query(Train).filter(Train.train_number == train.train_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Train already exists")
    new_train = Train(**train.dict())
    db.add(new_train)
    db.commit()
    db.refresh(new_train)
    return {"message": "Train added successfully", "train": new_train.name}

@app.get("/trains/")
def get_trains(db: Session = Depends(get_db)):
    trains = db.query(Train).all()
    return trains


# ─── Schedule Routes ───────────────────────────────────────────
@app.post("/schedules/")
def add_schedule(schedule: ScheduleCreate, db: Session = Depends(get_db)):
    new_schedule = Schedule(**schedule.dict())
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return {"message": "Schedule added successfully"}

@app.get("/schedules/")
def get_schedules(db: Session = Depends(get_db)):
    schedules = db.query(Schedule).all()
    return schedules


# ─── Health Check ──────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Smart Train Traffic Control API is running!"}

from conflict_detection import detect_conflicts

@app.get("/conflicts/")
def get_conflicts():
    conflicts = detect_conflicts()
    return {
        "total_conflicts": len(conflicts),
        "conflicts": conflicts
    }
from predictor import predict_delay
from pydantic import BaseModel

class DelayPredictionRequest(BaseModel):
    train_id: int
    train_type: str
    station_id: int
    day_of_week: int
    hour: int

@app.post("/predict-delay/")
def get_delay_prediction(request: DelayPredictionRequest):
    result = predict_delay(
        train_id=request.train_id,
        train_type=request.train_type,
        station_id=request.station_id,
        day_of_week=request.day_of_week,
        hour=request.hour
    )
    return result
# ─── What-if Simulation ────────────────────────────────────────
class WhatIfRequest(BaseModel):
    train_id: int
    delay_minutes: int

@app.post("/whatif/")
def whatif_simulation(request: WhatIfRequest, db: Session = Depends(get_db)):
    # Get all schedules
    all_schedules = db.query(Schedule).all()
    
    # Apply delay to the selected train
    modified_schedules = []
    for s in all_schedules:
        if s.train_id == request.train_id:
            # Add delay to departure and arrival times
            dep_parts = s.departure_time.split(":")
            arr_parts = s.arrival_time.split(":")
            
            dep_minutes = int(dep_parts[0]) * 60 + int(dep_parts[1]) + request.delay_minutes
            arr_minutes = int(arr_parts[0]) * 60 + int(arr_parts[1]) + request.delay_minutes
            
            # Convert back to HH:MM
            new_dep = f"{dep_minutes // 60:02d}:{dep_minutes % 60:02d}"
            new_arr = f"{arr_minutes // 60:02d}:{arr_minutes % 60:02d}"
            
            modified_schedules.append({
                "id": s.id,
                "train_id": s.train_id,
                "station_id": s.station_id,
                "departure_time": new_dep,
                "arrival_time": new_arr,
                "day": s.day,
                "sequence": s.sequence
            })
        else:
            modified_schedules.append({
                "id": s.id,
                "train_id": s.train_id,
                "station_id": s.station_id,
                "departure_time": s.departure_time,
                "arrival_time": s.arrival_time,
                "day": s.day,
                "sequence": s.sequence
            })

    # Run conflict detection on modified schedules
    conflicts = []
    for i in range(len(modified_schedules)):
        for j in range(i + 1, len(modified_schedules)):
            s1 = modified_schedules[i]
            s2 = modified_schedules[j]

            if s1["train_id"] == s2["train_id"]:
                continue

            if s1["station_id"] == s2["station_id"] and s1["day"] == s2["day"]:
                dep1 = int(s1["departure_time"].split(":")[0]) * 60 + int(s1["departure_time"].split(":")[1])
                dep2 = int(s2["departure_time"].split(":")[0]) * 60 + int(s2["departure_time"].split(":")[1])

                if abs(dep1 - dep2) <= 10:
                    train1 = db.query(Train).filter(Train.id == s1["train_id"]).first()
                    train2 = db.query(Train).filter(Train.id == s2["train_id"]).first()
                    station = db.query(Station).filter(Station.id == s1["station_id"]).first()

                    conflicts.append({
                        "station": station.name,
                        "train_1": train1.name,
                        "train_1_departure": s1["departure_time"],
                        "train_2": train2.name,
                        "train_2_departure": s2["departure_time"],
                        "time_gap_minutes": abs(dep1 - dep2)
                    })

    # Get the delayed train name
    delayed_train = db.query(Train).filter(Train.id == request.train_id).first()

    return {
        "simulation": f"Delayed {delayed_train.name} by {request.delay_minutes} minutes",
        "total_conflicts_after_delay": len(conflicts),
        "conflicts": conflicts,
        "verdict": "SAFE ✅" if len(conflicts) == 0 else "UNSAFE ❌ - New conflicts detected!"
    }