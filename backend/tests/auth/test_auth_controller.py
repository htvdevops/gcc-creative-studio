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
"""Tests for the GIS redirect-mode sign-in callback."""

from unittest.mock import patch

CALLBACK_URL = "/api/auth/callback"


def _post_callback(client, credential="jwt", csrf_body="tok", csrf_cookie="tok"):
    if csrf_cookie is not None:
        client.cookies.set("g_csrf_token", csrf_cookie)
    data = {"credential": credential}
    if csrf_body is not None:
        data["g_csrf_token"] = csrf_body
    return client.post(CALLBACK_URL, data=data, follow_redirects=False)


def test_callback_valid_credential_redirects_with_fragment(api_client):
    with patch(
        "src.auth.auth_controller.id_token.verify_oauth2_token",
        return_value={"email": "user@example.com"},
    ):
        response = _post_callback(api_client, credential="valid-jwt")

    assert response.status_code == 303
    assert response.headers["location"].endswith("/login#credential=valid-jwt")


def test_callback_csrf_mismatch_redirects_with_error(api_client):
    response = _post_callback(api_client, csrf_body="a", csrf_cookie="b")

    assert response.status_code == 303
    assert "#error=" in response.headers["location"]


def test_callback_missing_csrf_cookie_redirects_with_error(api_client):
    response = _post_callback(api_client, csrf_cookie=None)

    assert response.status_code == 303
    assert "#error=" in response.headers["location"]


def test_callback_invalid_credential_redirects_with_error(api_client):
    with patch(
        "src.auth.auth_controller.id_token.verify_oauth2_token",
        side_effect=ValueError("bad token"),
    ):
        response = _post_callback(api_client, credential="garbage")

    assert response.status_code == 303
    assert "#error=" in response.headers["location"]
