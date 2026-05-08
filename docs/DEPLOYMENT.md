# Cloud Run Deployment Guide

This project is prepared to be deployed as a containerized microservice on Google Cloud Run.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and configured.
- [Docker](https://www.docker.com/) installed (if building locally).
- A Google Cloud Project with Billing enabled.

## Deployment Steps

### 1. Configure GCloud

```bash
gcloud config set project [PROJECT_ID]
gcloud auth configure-docker
```

### 2. Build and Push to Artifact Registry (Recommended)

Replace `[REGION]` and `[PROJECT_ID]` with your values.

```bash
# Create repository if it doesn't exist
gcloud artifacts repositories create carrossel-tool --repository-format=docker --location=[REGION]

# Build and Push
gcloud builds submit --tag [REGION]-docker.pkg.dev/[PROJECT_ID]/carrossel-tool/api:latest .
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy carrossel-api \
  --image [REGION]-docker.pkg.dev/[PROJECT_ID]/carrossel-tool/api:latest \
  --region [REGION] \
  --platform managed \
  --allow-unauthenticated
```

## Environment Variables

- `PORT`: Defaults to `8080`. Cloud Run sets this automatically.

## Local Testing with Docker

```bash
docker build -t carrossel-tool .
docker run -p 8080:8080 carrossel-tool
```
