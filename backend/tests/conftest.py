import os
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from geoalchemy2 import Geometry
import geoalchemy2.admin.dialects.sqlite as sqlite_admin
from fastapi.testclient import TestClient

# Mock geoalchemy2 SQLite admin hooks before Base metadata creates/drops tables
sqlite_admin.after_create = lambda *args, **kwargs: None
sqlite_admin.before_create = lambda *args, **kwargs: None
sqlite_admin.after_drop = lambda *args, **kwargs: None
sqlite_admin.before_drop = lambda *args, **kwargs: None


@compiles(Geometry, "sqlite")
def compile_geometry_sqlite(type_, compiler, **kw):
    return "TEXT"


from app.database import Base, get_db
from app.models.user import User
from app.models.report import Report
from app.services.auth import hash_password, create_access_token
from app.main import app

# Engine with custom sqlite functions to mock PostGIS EWKT/EWKB
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(engine, "connect")
def connect_sqlite(dbapi_con, con_record):
    dbapi_con.create_function("GeomFromEWKT", 1, lambda val: val)
    dbapi_con.create_function("AsEWKT", 1, lambda val: val)
    dbapi_con.create_function("AsEWKB", 1, lambda val: None)
    dbapi_con.create_function("ST_AsBinary", 1, lambda val: None)
    dbapi_con.create_function("CheckSpatialIndex", 2, lambda *args: 0)
    dbapi_con.create_function("DiscardGeometryColumn", 2, lambda *args: 0)


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Sets required dummy environment variables for tests."""
    os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-32charslong!"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["REDIS_URL"] = "redis://localhost:6379/0"
    yield


@pytest.fixture(scope="function")
def db_session():
    """Creates a fresh database session for a test function."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def override_get_db(db_session):
    """Overrides the FastAPI get_db dependency to point to the test in-memory DB."""
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def client():
    """Provides a TestClient for FastAPI."""
    with TestClient(app) as test_client:
        yield test_client


# Precomputed bcrypt hash of "password123" for ultra-fast test execution
TEST_PASSWORD_HASH = "$2b$12$J3uK0yhXugfDD/npaIsuK.aSUgQ/Vlr7PEq1QljE/MaVg80wbuUxW"


@pytest.fixture
def test_user(db_session):
    """Creates and returns a default verified test user."""
    user = User(
        username="mangrove_guard",
        email="guard@tidaltrees.org",
        password_hash=TEST_PASSWORD_HASH,
        points=150,
        reports_count=5,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    """Returns authorization headers containing a valid JWT for test_user."""
    token = create_access_token(data={"sub": str(test_user.id), "username": test_user.username})
    return {"Authorization": f"Bearer {token}"}
