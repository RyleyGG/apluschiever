
import { CanActivateFn } from "@angular/router";



export const signupGuard: CanActivateFn = async () => {
    return true;
};

export const signinGuard: CanActivateFn = async () => {
    return true;
};

export const signoutGuard: CanActivateFn = async () => {
    return true;
};

// Other guards for different user role types can go here