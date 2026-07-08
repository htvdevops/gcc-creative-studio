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
"""Google Identity Services (GIS) redirect-mode sign-in callback."""

import asyncio
import logging
from urllib.parse import quote

from fastapi import APIRouter, Cookie, Form, status
from fastapi.responses import RedirectResponse
from google.auth.transport import requests as google_auth_requests
from google.oauth2 import id_token

from src.config.config_service import config_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

LOGIN_PATH = "/login"


def _login_redirect(fragment: str) -> RedirectResponse:
    # 303 turns the incoming POST navigation into a GET on the login page.
    return RedirectResponse(
        url=f"{config_service.FRONTEND_URL}{LOGIN_PATH}#{fragment}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post("/callback")
async def google_signin_callback(
    credential: str = Form(...),
    g_csrf_token_body: str = Form(default="", alias="g_csrf_token"),
    g_csrf_token_cookie: str = Cookie(default="", alias="g_csrf_token"),
) -> RedirectResponse:
    """Receives the form POST from Google Sign-In (ux_mode: redirect).

    Verifies the CSRF double-submit token and the credential itself, then
    hands the credential to the SPA via the URL fragment (never sent to
    servers or access logs).
    """
    if (
        not g_csrf_token_body
        or not g_csrf_token_cookie
        or g_csrf_token_body != g_csrf_token_cookie
    ):
        logger.warning("GIS callback rejected: CSRF token missing or mismatched.")
        return _login_redirect("error=Sign-in%20request%20could%20not%20be%20verified.%20Please%20try%20again.")

    try:
        await asyncio.to_thread(
            id_token.verify_oauth2_token,
            credential,
            google_auth_requests.Request(),
            audience=config_service.GOOGLE_TOKEN_AUDIENCE,
        )
    except Exception:
        logger.exception("GIS callback rejected: credential verification failed.")
        return _login_redirect("error=Sign-in%20failed.%20Please%20try%20again.")

    return _login_redirect(f"credential={quote(credential)}")
