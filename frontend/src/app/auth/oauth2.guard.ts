import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { OAuth2Service } from "./oauth2.service";

/**
 * Guard to prevent access to the sign up page for authenticated users.
 * Will redirect to the landing page
 */
export const signupGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const router = inject(Router);


    const isUserAuthenticated = await firstValueFrom(authService.validate_token());
    if (isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }

    return true;
};

/**
 * Guard to prevent access to the sign in page for authenticated users.
 * Will redirect to the landing page
 */
export const signinGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());
    console.log(isUserAuthenticated);

    if (isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }

    return true;
};

/**
 * Guard to prevent access to the sign out page for unauthenticated users.
 * Will redirect to the landing page
 */
export const signoutGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());

    if (!isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }

    return true;
};

// Other guards for different user role types can go here