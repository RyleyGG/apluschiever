import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing"
import { OAuth2Service } from "./oauth2.service";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { SignInInfo, SignUpInfo, SuccessfulUserAuth } from "../core/models/auth.interface";
import { firstValueFrom } from "rxjs";
import { LocalStorageService } from "../core/services/local-storage/local-storage.service";

const REST_API_SERVER = "http://localhost:8000";

const MOCK_SIGN_UP_INFO: SignUpInfo = {
    first_name: 'Test',
    last_name: 'User',
    email_address: 'testuser@provider.domain',
    password: 'notR3al123',
    user_type: 'Student'
};

const MOCK_SIGN_IN_INFO: SignInInfo = {
    username: 'testuser@provider.domain',
    password: 'notR3al123'
};

const EXPECTED_SUCCESSFUL_USER_AUTH: SuccessfulUserAuth = {
    access_token: 'mock_access_token',
    refresh_token: 'mock_refresh_token',
    token_type: 'mock_token'
};

describe('OAuth2Service', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let localStorageService: LocalStorageService;
    let service: OAuth2Service;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
        localStorageService = TestBed.inject(LocalStorageService);
        service = TestBed.inject(OAuth2Service);
    });

    afterEach(() => {
        httpTestingController.verify(); // this ensures we made no calls that were unnecessary
        localStorageService.deleteAll(); // this clears any local storage so it doesn't affect other tests
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should hit the sign up endpoint', async () => {
        const signUpValue = firstValueFrom(service.sign_up(MOCK_SIGN_UP_INFO));

        const expectedCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_up', 'Request to backend for signing up');
        expect(expectedCall.request.method).toBe('POST');

        expectedCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);

        expect(await signUpValue).toEqual(EXPECTED_SUCCESSFUL_USER_AUTH);
    });

    it('should hit the sign in endpoint', async () => {
        const signInValue = firstValueFrom(service.sign_in(MOCK_SIGN_IN_INFO));

        const expectedCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_in', 'Request to backend for signing in');
        expect(expectedCall.request.method).toBe('POST');

        expectedCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);

        expect(await signInValue).toEqual(EXPECTED_SUCCESSFUL_USER_AUTH);
    });

    it('should set tokens in local storage after signing in', async () => {
        // Make API call (same as hitting endpoint test)
        const signInValue = firstValueFrom(service.sign_in(MOCK_SIGN_IN_INFO));
        const expectedCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_in', 'Request to backend for signing in');
        expect(expectedCall.request.method).toBe('POST');
        expectedCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);
        await signInValue;

        // Check local storage for mock tokens to be there
        expect(localStorageService.get('access_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.access_token);
        expect(localStorageService.get('refresh_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.refresh_token);
    });

    it('should not attempt refresh without tokens set', () => {
        const refreshTokenValue = firstValueFrom(service.refresh_token());
        httpTestingController.verify();
    });

    it('should hit the refresh endpoint', async () => {
        // Sign in
        const signInValue = firstValueFrom(service.sign_in(MOCK_SIGN_IN_INFO));
        const expectedSignInCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_in', 'Request to backend for signing in');
        expect(expectedSignInCall.request.method).toBe('POST');
        expectedSignInCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);

        // Make refresh call (same as hitting endpoint test)
        const refreshTokenValue = firstValueFrom(service.refresh_token());
        const expectedCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/refresh', 'Request to backend for refresh');
        expect(expectedCall.request.method).toBe('POST');
        expectedCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);
        expect(await refreshTokenValue).toEqual(EXPECTED_SUCCESSFUL_USER_AUTH);
    });

    it('should set tokens after successful refresh', async () => {
        // Sign in
        const signInValue = firstValueFrom(service.sign_in(MOCK_SIGN_IN_INFO));
        const expectedSignInCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_in', 'Request to backend for signing in');
        expect(expectedSignInCall.request.method).toBe('POST');
        expectedSignInCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);

        // Make refresh call
        const refreshTokenValue = firstValueFrom(service.refresh_token());
        const expectedRefreshCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/refresh', 'Request to backend for refresh');
        expect(expectedRefreshCall.request.method).toBe('POST');
        expectedRefreshCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);
        expect(await refreshTokenValue).toEqual(EXPECTED_SUCCESSFUL_USER_AUTH);

        // Check local storage for mock tokens to be there
        expect(localStorageService.get('access_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.access_token);
        expect(localStorageService.get('refresh_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.refresh_token);
    });

    it('should clear tokens on signout', async () => {
        // Make API call (same as hitting endpoint test)
        const signInValue = firstValueFrom(service.sign_in(MOCK_SIGN_IN_INFO));
        const expectedCall = httpTestingController.expectOne(REST_API_SERVER + '/auth/sign_in', 'Request to backend for signing in');
        expect(expectedCall.request.method).toBe('POST');
        expectedCall.flush(EXPECTED_SUCCESSFUL_USER_AUTH);
        await signInValue;

        // Check local storage for mock tokens to be there
        expect(localStorageService.get('access_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.access_token);
        expect(localStorageService.get('refresh_token')).toBe(EXPECTED_SUCCESSFUL_USER_AUTH.refresh_token);

        service.sign_out();

        // Check they were removed properly
        expect(localStorageService.get('access_token')).toBe(null);
        expect(localStorageService.get('refresh_token')).toBe(null);
    });
});