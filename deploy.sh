#!/bin/bash

# Configuration
PROJECT_ID="cocreator-470801"
REGION="us-central1"
REPO_NAME="carrossel-tool"
IMAGE_NAME="api"
GITHUB_REPO="https://github.com/s1d40/carrossel_satori_api.git"

echo "🚀 Starting Deployment Process..."

# 1. GitHub Sync
echo "-----------------------------------"
echo "📂 Step 1: Syncing with GitHub..."
echo "-----------------------------------"

if [ ! -d ".git" ]; then
    git init
    git remote add origin $GITHUB_REPO
    git branch -M main
fi

# Check for git user identity
if [ -z "$(git config user.name)" ]; then
    read -p "⚠️ Git user.name not set. Enter your name: " git_user
    git config user.name "$git_user"
fi

if [ -z "$(git config user.email)" ]; then
    read -p "⚠️ Git user.email not set. Enter your email: " git_email
    git config user.email "$git_email"
fi

git add .
git commit -m "feat: automated deployment and documentation update"
echo "Pushing to GitHub (may require login)..."
git push -u origin main

# 2. Cloud Run Deployment
echo "-----------------------------------"
echo "☁️ Step 2: Deploying to Cloud Run..."
echo "-----------------------------------"

# Enable services
echo "Enabling required GCP services..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID

# Create Artifact Registry if it doesn't exist
echo "Ensuring Artifact Registry exists..."
gcloud artifacts repositories describe $REPO_NAME --location=$REGION --project=$PROJECT_ID &>/dev/null || \
gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --project=$PROJECT_ID

# Build and Push
echo "Building container image with Cloud Build..."
gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:latest . --project=$PROJECT_ID

# Deploy
echo "Deploying service to Cloud Run..."
gcloud run deploy carrossel-api \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --project=$PROJECT_ID

echo "-----------------------------------"
echo "✅ Deployment Complete!"
echo "-----------------------------------"
