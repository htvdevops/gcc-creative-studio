/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import {GoogleAuthProvider} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {AuthService} from './../common/services/auth.service';
import {UserModel} from './../common/models/user.model';
import {MatSnackBar} from '@angular/material/snack-bar';
import {handleErrorSnackbar} from '../utils/handleMessageSnackbar';
import {environment} from '../../environments/environment';
import {isPlatformBrowser} from '@angular/common';

const HOME_ROUTE = '/';

interface LooseObject {
  [key: string]: any;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
  private readonly provider: GoogleAuthProvider = new GoogleAuthProvider();

  @ViewChild('googleButtonMobile')
  googleButtonMobile?: ElementRef<HTMLElement>;
  @ViewChild('googleButtonDesktop')
  googleButtonDesktop?: ElementRef<HTMLElement>;

  loader = false;
  invalidLogin = false;
  errorMessage = '';
  isBrowser: boolean;
  isLocalEnv = environment?.isLocal ?? false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public ngZone: NgZone,
    private _snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.provider.setCustomParameters({
      prompt: 'select_account',
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // In deployed environments the official Google Sign-In button drives the
    // login; render it once the view (and its containers) exist.
    if (!this.isBrowser || this.isLocalEnv) return;

    const containers = [this.googleButtonDesktop, this.googleButtonMobile]
      .filter((ref): ref is ElementRef<HTMLElement> => !!ref)
      .map(ref => ref.nativeElement);

    this.authService.renderGoogleSignInButton(containers).subscribe({
      next: credential =>
        this.ngZone.run(() => this.completeIdentityPlatformSignIn(credential)),
      error: error =>
        this.ngZone.run(() => {
          console.error('Google Sign-In button error:', error);
          this.handleLoginError(
            error || {
              message:
                'An unexpected error occurred during sign-in. Please try again.',
            },
          );
        }),
    });
  }

  // Local development only: deployed environments use the rendered Google
  // Sign-In button instead (see ngAfterViewInit).
  loginWithGoogle() {
    this.loader = true;
    this.invalidLogin = false;
    this.errorMessage = '';

    this.authService.signInWithGoogleFirebase().subscribe({
      next: (firebaseToken: string) => {
        // The token and minimal user details are already stored in
        // localStorage. We just need to redirect to trigger the AuthGuard.
        this.ngZone.run(() => {
          this.loader = false;
          void this.router.navigate([HOME_ROUTE]);
        });
      },
      error: error => {
        this.loader = false;
        console.error('FIREBASE Login Process Error:', error);
        this.handleLoginError(
          error || {
            message:
              'An unexpected error occurred during sign-in. Please try again.',
          },
        );
      },
    });
  }

  private completeIdentityPlatformSignIn(credential: string): void {
    this.loader = true;
    this.invalidLogin = false;
    this.errorMessage = '';

    this.authService.signInForGoogleIdentityPlatform(credential).subscribe({
      next: () => {
        // The token and minimal user details are already stored in
        // localStorage. We just need to redirect to trigger the AuthGuard.
        this.ngZone.run(() => {
          this.loader = false;
          void this.router.navigate([HOME_ROUTE]);
        });
      },
      error: error => {
        this.loader = false;
        console.error('Identity Platform Login Process Error:', error);
        this.handleLoginError(
          error || {
            message:
              'An unexpected error occurred during sign-in. Please try again.',
          },
        );
      },
    });
  }

  private handleLoginError(error: any, postErrorAction?: () => void) {
    this.loader = false;
    handleErrorSnackbar(this._snackBar, error, 'Login Error');
    if (postErrorAction) {
      postErrorAction();
    }
  }

  redirect(user: UserModel) {
    if (this.isBrowser) {
      localStorage.setItem('USER_DETAILS', JSON.stringify(user));
    }
    this.loader = false;
    void this.router.navigate([HOME_ROUTE]);
  }
}
