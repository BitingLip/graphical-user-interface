#!/usr/bin/env python3
"""
Mock Backend API for BitingLip UI Testing
Provides all the endpoints that the UI expects to connect to.
"""

import json
import random
import time
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

app = FastAPI(title="BitingLip Mock API", version="1.0.0")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
mock_data = {
    "models": [
        {
            "id": "model-001",
            "name": "GPT-2 Base",
            "description": "OpenAI GPT-2 language model for text generation",
            "model_type": "text-generation",
            "version": "1.0.0",
            "size_gb": 2.4,
            "status": "ready",
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-15T10:00:00Z",
            "metrics": {
                "accuracy": 0.87,
                "total_runs": 1524,
                "avg_response_time": 0.45,
                "error_rate": 0.02
            }
        },
        {
            "id": "model-002", 
            "name": "Stable Diffusion XL",
            "description": "High-resolution image generation model",
            "model_type": "image-generation",
            "version": "1.2.0",
            "size_gb": 6.8,
            "status": "deployed",
            "created_at": "2024-01-20T14:30:00Z",
            "updated_at": "2024-01-20T14:30:00Z",
            "metrics": {
                "accuracy": 0.92,
                "total_runs": 856,
                "avg_response_time": 2.1,
                "error_rate": 0.01
            }
        },
        {
            "id": "model-003",
            "name": "LLaMA 2 7B",
            "description": "Meta's LLaMA 2 model for conversational AI",
            "model_type": "text-generation", 
            "version": "2.0.0",
            "size_gb": 13.2,
            "status": "loading",
            "created_at": "2024-01-25T09:15:00Z",
            "updated_at": "2024-01-25T09:15:00Z",
            "metrics": {
                "accuracy": 0.89,
                "total_runs": 423,
                "avg_response_time": 0.78,
                "error_rate": 0.03
            }
        }
    ],
    "clusters": [
        {
            "id": "cluster-001",
            "name": "GPU Cluster Alpha",
            "description": "Primary cluster for text generation workloads",
            "status": "active",
            "worker_count": 4,
            "total_gpus": 8,
            "available_gpus": 3,
            "cpu_usage": 0.65,
            "memory_usage": 0.72,
            "gpu_usage": 0.58,
            "created_at": "2024-01-10T08:00:00Z",
            "updated_at": "2024-01-31T15:45:00Z"
        },
        {
            "id": "cluster-002",
            "name": "GPU Cluster Beta", 
            "description": "Secondary cluster for image generation",
            "status": "active",
            "worker_count": 2,
            "total_gpus": 4,
            "available_gpus": 1,
            "cpu_usage": 0.82,
            "memory_usage": 0.91,
            "gpu_usage": 0.78,
            "created_at": "2024-01-12T10:30:00Z",
            "updated_at": "2024-01-31T15:45:00Z"
        }
    ],
    "tasks": [
        {
            "id": "task-001",
            "name": "Text Generation Job",
            "model_id": "model-001",
            "cluster_id": "cluster-001",
            "status": "completed",
            "task_type": "text-generation",
            "priority": "medium",
            "created_at": "2024-01-31T14:30:00Z",
            "updated_at": "2024-01-31T14:32:15Z",
            "execution_time": 2.15,
            "input_data": {"prompt": "Write a story about AI"},
            "output_data": {"generated_text": "Once upon a time, in a world where artificial intelligence..."}
        },
        {
            "id": "task-002", 
            "name": "Image Generation Task",
            "model_id": "model-002",
            "cluster_id": "cluster-002", 
            "status": "running",
            "task_type": "image-generation",
            "priority": "high",
            "created_at": "2024-01-31T15:00:00Z",
            "updated_at": "2024-01-31T15:02:30Z",
            "execution_time": None,
            "input_data": {"prompt": "A beautiful sunset over mountains"},
            "output_data": None
        }
    ],
    "workers": [
        {
            "id": "worker-001",
            "name": "GPU-Worker-01",
            "cluster_id": "cluster-001",
            "status": "active",
            "host": "192.168.1.100",
            "port": 8080,
            "gpu_count": 2,
            "gpu_memory": 24000,
            "cpu_usage": 0.45,
            "memory_usage": 0.68,
            "gpu_usage": 0.32,
            "max_tasks": 4,
            "active_tasks": 1,
            "last_heartbeat": "2024-01-31T15:45:00Z"
        },
        {
            "id": "worker-002",
            "name": "GPU-Worker-02", 
            "cluster_id": "cluster-001",
            "status": "active",
            "host": "192.168.1.101",
            "port": 8080,
            "gpu_count": 2,
            "gpu_memory": 24000,
            "cpu_usage": 0.72,
            "memory_usage": 0.81,
            "gpu_usage": 0.65,
            "max_tasks": 4,
            "active_tasks": 3,
            "last_heartbeat": "2024-01-31T15:45:00Z"
        }
    ]
}

# Pydantic models for request/response validation
class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: str
    created_at: str
    last_login: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# Auth endpoints
@app.post("/api/v1/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    # Mock authentication - accept any credentials for demo
    user = User(
        id="user-001",
        username=request.username,
        email=f"{request.username}@bitinglip.dev",
        name=f"{request.username.title()} User",
        role="admin",
        created_at="2024-01-01T00:00:00Z",
        last_login=datetime.now().isoformat() + "Z"
    )
    
    return AuthResponse(
        access_token=f"mock-token-{int(time.time())}",
        user=user
    )

@app.get("/api/v1/auth/profile", response_model=User)
async def get_profile():
    return User(
        id="user-001",
        username="admin", 
        email="admin@bitinglip.dev",
        name="Admin User",
        role="admin",
        created_at="2024-01-01T00:00:00Z",
        last_login=datetime.now().isoformat() + "Z"
    )

@app.post("/api/v1/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# Models endpoints
@app.get("/api/v1/models")
async def get_models():
    return {"data": mock_data["models"], "success": True}

@app.get("/api/v1/models/{model_id}")
async def get_model(model_id: str):
    model = next((m for m in mock_data["models"] if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"data": model, "success": True}

@app.post("/api/v1/models/{model_id}/deploy")
async def deploy_model(model_id: str, payload: dict):
    model = next((m for m in mock_data["models"] if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model["status"] = "deployed"
    return {"data": model, "success": True, "message": "Model deployed successfully"}

# Clusters endpoints
@app.get("/api/v1/clusters")
async def get_clusters():
    return {"data": mock_data["clusters"], "success": True}

@app.get("/api/v1/clusters/{cluster_id}")
async def get_cluster(cluster_id: str):
    cluster = next((c for c in mock_data["clusters"] if c["id"] == cluster_id), None)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return {"data": cluster, "success": True}

@app.post("/api/v1/clusters")
async def create_cluster(payload: dict):
    new_cluster = {
        "id": f"cluster-{len(mock_data['clusters']) + 1:03d}",
        "name": payload.get("name", "New Cluster"),
        "description": payload.get("description", ""),
        "status": "active",
        "worker_count": 0,
        "total_gpus": 0,
        "available_gpus": 0,
        "cpu_usage": 0.0,
        "memory_usage": 0.0,
        "gpu_usage": 0.0,
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z"
    }
    mock_data["clusters"].append(new_cluster)
    return {"data": new_cluster, "success": True, "message": "Cluster created successfully"}

# Tasks endpoints
@app.get("/api/v1/tasks")
async def get_tasks():
    return {"data": mock_data["tasks"], "success": True}

@app.get("/api/v1/tasks/{task_id}")
async def get_task(task_id: str):
    task = next((t for t in mock_data["tasks"] if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"data": task, "success": True}

@app.post("/api/v1/tasks")
async def create_task(payload: dict):
    new_task = {
        "id": f"task-{len(mock_data['tasks']) + 1:03d}",
        "name": payload.get("name", "New Task"),
        "model_id": payload.get("model_id"),
        "cluster_id": payload.get("cluster_id"),
        "status": "pending",
        "task_type": payload.get("task_type", "text-generation"),
        "priority": payload.get("priority", "medium"),
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        "execution_time": None,
        "input_data": payload.get("input_data", {}),
        "output_data": None
    }
    mock_data["tasks"].append(new_task)
    return {"data": new_task, "success": True, "message": "Task created successfully"}

# Workers endpoints
@app.get("/api/v1/workers")
async def get_workers():
    return {"data": mock_data["workers"], "success": True}

@app.get("/api/v1/workers/{worker_id}")
async def get_worker(worker_id: str):
    worker = next((w for w in mock_data["workers"] if w["id"] == worker_id), None)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"data": worker, "success": True}

# System monitoring endpoints
@app.get("/api/v1/monitoring/system")
async def get_system_metrics():
    return {
        "data": {
            "timestamp": datetime.now().isoformat() + "Z",
            "cpu_usage": random.uniform(0.3, 0.8),
            "memory_usage": random.uniform(0.4, 0.9),
            "gpu_usage": random.uniform(0.2, 0.7),
            "network_io": random.uniform(100, 1000),
            "disk_io": random.uniform(50, 500),
            "active_tasks": len([t for t in mock_data["tasks"] if t["status"] == "running"]),
            "total_workers": len(mock_data["workers"]),
            "active_workers": len([w for w in mock_data["workers"] if w["status"] == "active"])
        },
        "success": True
    }

@app.get("/api/v1/monitoring/alerts")
async def get_alerts():
    alerts = [
        {
            "id": "alert-001",
            "type": "warning",
            "message": "High GPU utilization on cluster-002",
            "timestamp": datetime.now().isoformat() + "Z",
            "severity": "medium"
        },
        {
            "id": "alert-002", 
            "type": "info",
            "message": "Model deployment completed successfully",
            "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat() + "Z",
            "severity": "low"
        }
    ]
    return {"data": alerts, "success": True}

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat() + "Z",
        "service": "BitingLip Mock API",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "BitingLip Mock API",
        "documentation": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    print("🚀 Starting BitingLip Mock Backend API...")
    print("📖 API Documentation: http://localhost:8001/docs")
    print("❤️  Health Check: http://localhost:8001/health")
    print("🔧 Mock data loaded with sample models, clusters, tasks, and workers")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
        reload=True
    )
