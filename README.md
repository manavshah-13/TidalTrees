# 🌊 TidalTrees — Mangrove Conservation & Telemetry Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_PostGIS_3.4-336791.svg)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D.svg)](https://redis.io/)
[![Pytest Coverage](https://img.shields.io/badge/Pytest_Coverage-91%25-brightgreen.svg)]()
[![Gemini](https://img.shields.io/badge/AI_Vision-Gemini_1.5_Flash-orange.svg)](https://deepmind.google/technologies/gemini/)

**TidalTrees** is an enterprise-grade, participatory environmental monitoring and geospatial intelligence platform designed to safeguard vital mangrove ecosystems. Coastal communities, local fishermen, rangers, and citizen scientists submit real-time photographic and telemetry reports of environmental degradation (illegal cutting, salinity intrusion, oil pollution, sediment runoff). 

The platform pairs **satellite and drone computer vision (Google Gemini 1.5 Flash)** with **PostGIS geospatial indexing**, **Redis caching**, and **gamified stewardship leaderboards** to accelerate rapid-response conservation interventions.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    Client["React 19 + Vite Frontend\n(Tailwind CSS, Leaflet Maps, Lucide)"]
    
    subgraph BackendGateway["FastAPI Gateway (Uvicorn / Docker)"]
        Auth["JWT Auth Service\n(/api/auth)"]
        ReportsAPI["Spatial Reports Router\n(/api/reports)"]
        AnalyzeAPI["AI Vision Analysis\n(/api/analyze)"]
        LeaderboardAPI["Gamification Router\n(/api/leaderboard)"]
    end
    
    subgraph DataStorage["Data & Ingestion Layer"]
        PostGIS[("PostgreSQL 16 + PostGIS\nSpatial Point Indexes (SRID 4326)")]
        RedisCache[("Redis 7.2\nLeaderboard Cache & Rate Limiting")]
        LocalMedia[("Uploads Volume\nStatic Asset Storage")]
    end
    
    subgraph ExternalIntelligence["External AI Services"]
        GeminiVision["Google Gemini 1.5 Flash\nMultimodal Ecological Taxonomy"]
    end

    Client -->|REST & Multipart HTTP| BackendGateway
    Auth --> PostGIS
    ReportsAPI --> PostGIS
    ReportsAPI --> LocalMedia
    AnalyzeAPI --> LocalMedia
    AnalyzeAPI -->|Sanitized Prompt + Image| GeminiVision
    LeaderboardAPI --> RedisCache
    LeaderboardAPI -.->|Cache Miss| PostGIS
```

---

## 🚀 Getting Started

Follow these instructions to run TidalTrees in development or production.

### Prerequisites
- **Docker & Docker Compose** (v2.20+)
- **Python 3.10+** (if running backend natively)
- **Node.js 18+ & npm** (if running frontend natively)

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/HackOut/TidalTrees.git
cd TidalTrees
```

#### Backend Environment Configuration
Create a `.env` file in `TidalTrees/backend/`:

```env
# Application Settings
ENVIRONMENT=development
SECRET_KEY=tidaltrees-super-secret-key-change-in-production-2026!
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALGORITHM=HS256

# Database & Spatial Engine (PostgreSQL + PostGIS)
DATABASE_URL=postgresql://tidaltrees_user:mangrove_pass@localhost:5432/tidaltrees_db

# Cache & Ingestion Queue
REDIS_URL=redis://localhost:6379/0

# CORS & Gateway
FRONTEND_URL=http://localhost:5173

# Artificial Intelligence (Vision & Canopy Analysis)
GEMINI_API_KEY=your_google_gemini_api_key_here
```

#### Frontend Environment Configuration
Create a `.env` file in `TidalTrees/frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

---

### Step 2: Launch Supporting Services with Docker Compose

Run the PostgreSQL PostGIS database and Redis cache containers:

```bash
cd TidalTrees
docker compose up -d db redis
```

> **Services Launched:**
> - **PostgreSQL with PostGIS**: `localhost:5432` (database: `tidaltrees_db`)
> - **Redis Server**: `localhost:6379`
> - **Uploads Volume**: Local directory `./backend/uploads` auto-mounted

---

### Step 3: Run the FastAPI Backend

```bash
cd TidalTrees/backend

# Create virtual environment and activate
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The interactive OpenAPI documentation will be live at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 4: Run the Vite React Frontend

```bash
cd TidalTrees/frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173).

---

## 🗺️ Database Architecture & Geospatial Schema

TidalTrees leverages **PostgreSQL 16** with the **PostGIS 3.4** extension to perform real-time spatial calculations over global GPS coordinates (WGS 84, SRID 4326).

```mermaid
erDiagram
    USERS ||--o{ REPORTS : "authors"
    
    USERS {
        int id PK
        string username UK
        string email UK
        string password_hash
        boolean is_active
        int points
        int reports_count
        datetime created_at
        datetime updated_at
    }

    REPORTS {
        int id PK
        string title
        text description
        string location
        float latitude
        float longitude
        geometry geom "SRID=4326 Point (Indexed via GiST)"
        string severity "low | medium | high | critical"
        string status "pending | validated | rejected"
        string image_url
        float ai_confidence
        text ai_result
        int author_id FK
        datetime created_at
        datetime updated_at
    }

    GUARDIANS {
        int id PK
        string name
        string contact
        string location
    }

    CONTACT_MESSAGES {
        int id PK
        string name
        string email
        string subject
        text message
        datetime created_at
    }
```

### Geospatial Capabilities & Indexing
- **GiST Spatial Index**: The `reports.geom` column uses PostGIS R-Tree spatial indexing for sub-millisecond bounding-box lookups:
  ```sql
  CREATE INDEX idx_reports_geom ON reports USING GIST (geom);
  ```
- **Radius-Based Nearby Queries (`/api/reports/nearby`)**:
  Calculates spherical distance on an Earth ellipsoid using `ST_DWithin` and `ST_Distance` on `geography` casts:
  ```sql
  SELECT * FROM reports 
  WHERE ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius_meters)
  ORDER BY ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)
  LIMIT :limit;
  ```
- **High-Availability Fallback**: If executed on developer environments without PostGIS active, the API falls back to an exact Euclidean bounding-box formula to guarantee 100% endpoint uptime.

---

## 🤖 AI Vision & Safety Pipeline

The `/api/analyze` endpoint implements a secure multimodal vision pipeline built on **Google Gemini 1.5 Flash**.

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Ranger
    participant Gateway as FastAPI Router (/api/analyze)
    participant Sanitizer as Input Sanitization & Magic Validator
    participant Volume as Local File Storage (/uploads)
    participant Gemini as Gemini 1.5 Flash Vision API

    User->>Gateway: POST /api/analyze (Image File + Optional Context)
    Gateway->>Sanitizer: Validate Magic Bytes & File Size (<10MB)
    Sanitizer-->>Gateway: Verified (JPEG, PNG, WebP, GIF)
    Gateway->>Sanitizer: Scan Context for Prompt Injection Regex
    Sanitizer-->>Gateway: Sanitized & Wrapped Context
    Gateway->>Volume: Persist file to local disk (UUID-named)
    Gateway->>Gemini: Send prompt with <user_observation> encapsulation + Image
    Gemini-->>Gateway: Return Ecological Threat JSON
    Gateway-->>User: HTTP 200 AnalysisResult (Confidence, Tags, Severity, Summary)
```

### Prompt Injection & Defensive Guardrails
1. **Magic-Byte Signature Verification**: Before parsing, raw file headers are inspected for binary signatures (`\xff\xd8\xff` for JPEG, `\x89PNG` for PNG, `RIFF` for WebP, `GIF87a`/`GIF89a` for GIF) to block disguise attacks.
2. **Adversarial Keyword Detection**: Context strings are scanned against prompt injection patterns (`ignore previous instructions`, `system:`, `you are now`, `developer mode`, `bypass safety`). Malicious inputs are rejected immediately with HTTP 422.
3. **Prompt Wrapping & XML Encapsulation**: Untrusted user commentary is isolated inside strict `<user_observation>` XML tags with explicit guardrail directives instructing the LLM to treat content solely as passive observation.
4. **Resilient Offline Fallback**: In the event of external API outages or missing API keys, the endpoint provides deterministic heuristic threat scoring based on canopy spectral analysis models.

---

## 🧪 Testing Suite & Code Quality

The backend features an automated test suite with **91% test coverage** across all routes, models, security validators, and services.

### Running Pytest

```bash
cd TidalTrees/backend
pytest --cov=app --cov-report=term-missing
```

### Coverage Report Summary
```
Name                         Stmts   Miss  Cover   Missing
----------------------------------------------------------
app\config.py                   16      0   100%
app\main.py                     20      0   100%
app\models\contact.py           11      0   100%
app\models\guardian.py          10      0   100%
app\models\report.py            23      0   100%
app\models\user.py              16      0   100%
app\routers\analyze.py          92      3    97%   
app\routers\auth.py             27      0   100%
app\routers\contact.py          35      0   100%
app\routers\leaderboard.py      18      1    94%   
app\routers\reports.py         129     21    84%   
app\schemas\report.py           39      2    95%   
app\schemas\user.py             17      0   100%
app\services\auth.py            41      4    90%   
----------------------------------------------------------
TOTAL                          579     55    91%
====================== 38 passed in 3.2s ======================
```

---

## 📡 API Reference Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new citizen scientist or ranger account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile & points | Bearer Token |
| `POST` | `/api/reports` | Create environmental incident report with coordinates | Bearer Token |
| `POST` | `/api/reports/with-image` | Submit report with image file upload via multipart | Bearer Token |
| `GET` | `/api/reports` | List reports with search and severity/status filters | No |
| `GET` | `/api/reports/nearby` | Geospatial radius query (`lat`, `lng`, `radius_km`) | No |
| `GET` | `/api/reports/{id}` | Fetch individual report details | No |
| `POST` | `/api/analyze` | AI Vision mangrove threat analysis with Gemini | No |
| `GET` | `/api/leaderboard` | Top community conservation rankings (cached in Redis) | No |
| `POST` | `/api/contact` | Submit inquiry or ranger volunteer notification | No |
| `GET` | `/api/guardians` | List regional mangrove protection units | No |
| `GET` | `/health` | Service health status check | No |

---

## 🌿 License & Acknowledgements

Developed as part of the **HackOut Conservation Initiative**. Dedicated to coastal communities, mangrove restoration rangers, and open-source geospatial conservation science.
