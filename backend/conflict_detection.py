from database import SessionLocal, Schedule, Train, Station

def time_to_minutes(t: str) -> int:
    """Convert HH:MM to total minutes"""
    h, m = map(int, t.split(":"))
    return h * 60 + m

def detect_conflicts():
    db = SessionLocal()
    conflicts = []

    schedules = db.query(Schedule).all()

    # Group schedules by section (from_station -> to_station)
    for i in range(len(schedules)):
        for j in range(i + 1, len(schedules)):
            s1 = schedules[i]
            s2 = schedules[j]

            # Skip if same train
            if s1.train_id == s2.train_id:
                continue

            # Check if both trains are on the same section
            if s1.station_id == s2.station_id and s1.day == s2.day:
                dep1 = time_to_minutes(s1.departure_time)
                dep2 = time_to_minutes(s2.departure_time)

                # If two trains depart within 10 minutes = conflict
                if abs(dep1 - dep2) <= 10:
                    train1 = db.query(Train).filter(Train.id == s1.train_id).first()
                    train2 = db.query(Train).filter(Train.id == s2.train_id).first()
                    station = db.query(Station).filter(Station.id == s1.station_id).first()

                    conflicts.append({
                        "conflict_type": "Same Section Departure Conflict",
                        "station": station.name,
                        "train_1": train1.name,
                        "train_1_departure": s1.departure_time,
                        "train_2": train2.name,
                        "train_2_departure": s2.departure_time,
                        "time_gap_minutes": abs(dep1 - dep2),
                        "suggestion": f"Delay {train2.name} by {10 - abs(dep1 - dep2) + 1} minutes"
                    })

    db.close()
    return conflicts


if __name__ == "__main__":
    conflicts = detect_conflicts()
    if conflicts:
        print(f"\n⚠️  {len(conflicts)} Conflict(s) Detected!\n")
        for c in conflicts:
            print(f"🚨 {c['conflict_type']}")
            print(f"   Station  : {c['station']}")
            print(f"   Train 1  : {c['train_1']} departs {c['train_1_departure']}")
            print(f"   Train 2  : {c['train_2']} departs {c['train_2_departure']}")
            print(f"   Gap      : {c['time_gap_minutes']} minutes")
            print(f"   Fix      : {c['suggestion']}")
            print()
    else:
        print("✅ No conflicts detected!")