# DeepVariance Backend

REST API for CNN model training and dataset management, built with FastAPI + PostgreSQL + PyTorch.

## Features

- Dataset Management
- Model Management
- Training Jobs (LLM-powered CNN)
- System Monitoring
- Background Processing

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 15+

### Installation

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Setup database
psql postgres -c "CREATE DATABASE deepvariance;"
psql postgres -c "CREATE USER deepvariance WITH PASSWORD 'deepvariance';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE deepvariance TO deepvariance;"
psql deepvariance -c "GRANT ALL ON SCHEMA public TO deepvariance;"

# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your GROQ API key

# Run server
python main.py
```

API available at [http://localhost:8000](http://localhost:8000) and docs at [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Configuration

Edit `.env` file:
```env
DATABASE_URL=postgresql://deepvariance:deepvariance@localhost:5432/deepvariance
GROQ_API_KEY=your_groq_api_key_here
```

## License

© 2025 DeepVariance. All rights reserved.
