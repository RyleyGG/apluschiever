import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { first, map, take } from 'rxjs/operators';
import { OAuth2Service } from "./oauth2.service";
import { Observable } from 'rxjs';
import { UserService } from "../core/services/user/user.service";
import { CourseService } from "../core/services/course/course.service";

/**
 * Require a user to be signed in to proceed
 * @returns 
 */
export const signedInGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());

    if (!isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }
    return true;
};

/**
 * Require a user to be signed out to proceed
 * @returns 
 */
export const signedOutGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());

    if (isUserAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};

export const teacherOnlyGuard: CanActivateFn = async () => {
    const authService = inject(OAuth2Service);
    const userService = inject(UserService);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());
    if (!isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }

    const userData = await firstValueFrom(userService.getCurrentUser());
    if (!(userData.user_type == 'Teacher' || userData.user_type == 'Admin')) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
}

export const courseOwnerOnlyGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
    const authService = inject(OAuth2Service);
    const userService = inject(UserService);
    const courseService = inject(CourseService);
    const router = inject(Router);

    const isUserAuthenticated = await firstValueFrom(authService.validate_token());
    if (!isUserAuthenticated) {
        router.navigate(['/landing']);
        return false;
    }

    const userData = await firstValueFrom(userService.getCurrentUser());
    if (!(userData.user_type == 'Teacher' || userData.user_type == 'Admin')) {
        router.navigate(['/dashboard']);
        return false;
    }

    const course = await firstValueFrom(courseService.getCourse(route.paramMap.get('id')!));
    if (course.course.course_owner_id !== userData.id) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
}