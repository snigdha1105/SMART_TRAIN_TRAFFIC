from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.orm import sessionmaker, relationship

DATABASE_URL = "sqlite:///./train_traffic.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


class Station(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True)
    city = Column(String)


class Train(Base):
    __tablename__ = "trains"
    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String, unique=True)
    name = Column(String)
    type = Column(String)


class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    from_station_id = Column(Integer, ForeignKey("stations.id"))
    to_station_id = Column(Integer, ForeignKey("stations.id"))
    distance_km = Column(Float)


class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"))
    station_id = Column(Integer, ForeignKey("stations.id"))
    arrival_time = Column(String)
    departure_time = Column(String)
    day = Column(Integer)
    sequence = Column(Integer)


class Delay(Base):
    __tablename__ = "delays"
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"))
    actual_arrival = Column(String)
    actual_departure = Column(String)
    delay_minutes = Column(Float)
    date = Column(String)


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully!")


if __name__ == "__main__":
    create_tables()