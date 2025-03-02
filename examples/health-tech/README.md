# Health-Tech Remote Monitoring POC

A proof of concept for a health technology company to remotely monitor patients, leveraging motion tracking technology to assist in rehabilitation and healthcare monitoring.

## Overview

This project demonstrates a system that can:

1. Track and analyze patient movement data
2. Store patient information and health metrics
3. Visualize progress over time
4. Provide a dashboard for healthcare professionals

## Architecture

The project uses a three-tier architecture:

- **Database Layer**: PostgreSQL database for storing patient data, motion metrics, and health data
- **Backend API**: FastAPI for handling data processing and API endpoints
- **Frontend**: HTML/JavaScript with Tailwind CSS and Chart.js for visualization

## Features

- Patient management system
- Motion data collection and analysis
- Health metrics tracking
- Progress visualization with charts
- Session scheduling and management
- Real-time monitoring capabilities

## Installation

1. Clone the repository
2. Set up a virtual environment
3. Install dependencies:

```bash
cd examples/health-tech
pip install -r requirements.txt
```

## Configuration

1. Configure the database connection in `backend/database.py`
2. Initialize the database:

```bash
# For PostgreSQL
psql -U yourusername -d yourdatabase -f database/schema.sql

# For SQLite (default)
# The application will initialize the database automatically
```

## Running the Application

Start the backend server:

```bash
cd examples/health-tech
uvicorn backend.main:app --reload
```

The application will be available at http://localhost:8000

## API Documentation

Once the server is running, visit http://localhost:8000/docs for interactive API documentation.

## Directory Structure

```
examples/health-tech/
├── backend/
│   ├── main.py         # FastAPI application
│   ├── models.py       # Database models
│   ├── database.py     # Database connection
│   └── router.py       # API routes
├── frontend/
│   ├── index.html      # Main dashboard
│   ├── style.css       # Custom styles
│   └── app.js          # Frontend logic
├── database/
│   └── schema.sql      # Database schema
└── requirements.txt    # Project dependencies
```

## Integration with Motion Tracking

This POC can integrate with the existing motion tracking system by:

1. Using the `motion_extract_file.py` script to extract motion data from videos
2. Processing the data with `kinematics_calculator.py`
3. Uploading the processed CSV files via the API
4. Visualizing the results in the dashboard

## Future Enhancements

- Real-time motion tracking integration
- Advanced analytics and reporting
- Mobile application for patients
- AI-powered movement analysis
- Integration with wearable devices