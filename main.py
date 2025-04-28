from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import pandas as pd
import os

app = FastAPI()

import requests
import os

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REFRESH_TOKEN = os.getenv("refresh_token")

# Allow CORS for your React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def get_spotify_data(endpoint, token, params=None):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{SPOTIFY_API_BASE}{endpoint}", headers=headers, params=params)
    if response.status_code != 200:
        print("Spotify API Error:", response.json())
    return response.json()



@app.get("/top-artists")
async def top_artists(time_range: str, token: str):
    """
    Get user's top artists for the given time range.
    Note: The token should be the user's access token from Spotify.
    """
    data = get_spotify_data("/me/top/artists", token, params={"time_range": time_range})
    return data

@app.get("/top-songs")
async def top_songs(time_range: str, token: str):
    """
    Get user's top tracks for the given time range.
    """
    data = get_spotify_data("/me/top/tracks", token, params={"time_range": time_range})
    return data

@app.post("/create-playlist")
async def create_playlist(request: Request):
    """
    Create a new playlist based on the user's top 50 songs.
    Expected JSON body:
    {
        "token": "<user access token>",
        "user_id": "<spotify user id>",
        "playlist_name": "My Top 50",
        "track_ids": ["track_id1", "track_id2", ...]
    }
    """
    body = await request.json()
    token = body.get("token")
    user_id = body.get("user_id")
    playlist_name = body.get("playlist_name")
    track_ids = body.get("track_ids")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Step 1: Create Playlist
    create_url = f"{SPOTIFY_API_BASE}/users/{user_id}/playlists"
    payload = {"name": playlist_name, "description": "Created via my app", "public": False}
    playlist_response = requests.post(create_url, headers=headers, json=payload)
    if playlist_response.status_code != 201:
        raise HTTPException(status_code=playlist_response.status_code, detail=playlist_response.json())
    playlist = playlist_response.json()
    playlist_id = playlist["id"]
    
    # Step 2: Add tracks to the playlist (Spotify expects URIs)
    uris = [f"spotify:track:{tid}" for tid in track_ids]
    add_tracks_url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks"
    add_response = requests.post(add_tracks_url, headers=headers, json={"uris": uris})
    if add_response.status_code not in [201, 200]:
        raise HTTPException(status_code=add_response.status_code, detail=add_response.json())
    
    return {"message": "Playlist created successfully!", "playlist": playlist}


def refresh_access_token():
    url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url, data=data, headers=headers)

    if response.status_code == 200:
        token_info = response.json()
        new_access_token = token_info["access_token"]
        print("✅ New Access Token:", new_access_token)
        return new_access_token
    else:
        print("Error refreshing token:", response.json())
        return None


if __name__ == "__main__":
    TEST_TOKEN = "BQBHnPvi8PHDSvh906kfB3CMFQ6LfU4sxmnlzd4lKlQdKOZv17cW2eWNZ17WeO0gUQuf2TeeTj8P61XNLx5otaCw_5BOgyqBo6TO0GaXaCF7qJ9_WZABAn7lXnFl-mew7UT2xEL7sBxPI5_-WlYZkGG4U9dJ6V3bUcuvjz2SmC1K1jcyw5Aw2wBLbShTsWOpMcXajPnN0aAV8gZdjDZ5UZUKUSCtFnGsIjrKT1rynW8EJOwicTK0ajo8YBQc5ClXUr8Lq9M_1Z8"


