from collections.abc import Iterator

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlmodel import Session, create_engine


def make_engine(databaseUrl: str) -> Engine:
    if databaseUrl.startswith("postgres://"):
        databaseUrl = "postgresql+psycopg://" + databaseUrl[len("postgres://"):]
    elif databaseUrl.startswith("postgresql://"):
        databaseUrl = "postgresql+psycopg://" + databaseUrl[len("postgresql://"):]
    if databaseUrl.startswith("sqlite"):
        engine = create_engine(databaseUrl, connect_args={"check_same_thread": False})

        @event.listens_for(engine, "connect")
        def foreign_keys(connection, _):
            connection.execute("PRAGMA foreign_keys=ON")

        return engine
    return create_engine(databaseUrl, pool_pre_ping=True)


def session_maker(engine: Engine):
    def open_session() -> Iterator[Session]:
        with Session(engine) as session:
            yield session

    return open_session
