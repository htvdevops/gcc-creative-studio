# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Tests for Generation Options Controller."""


def test_get_image_generation_options_success(api_client):
    response = api_client.get("/api/options/image-generation")
    assert response.status_code == 200
    data = response.json()
    # verify some fields exist
    assert "generation_models" in data or "generationModels" in data
    assert "styles" in data


def test_get_image_generation_options_requires_auth(api_client):
    """The endpoint must reject requests without a Bearer token."""
    from main import app
    from src.auth.auth_guard import get_current_user

    # Drop the authenticated-user override installed by the api_client
    # fixture so the request is treated as anonymous.
    del app.dependency_overrides[get_current_user]
    try:
        response = api_client.get("/api/options/image-generation")
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()
