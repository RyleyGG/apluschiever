import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing"
import { OAuth2Service } from "./oauth2.service";
import { HttpClient, provideHttpClient } from "@angular/common/http";

describe('OAuth2Service', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
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
        service = TestBed.inject(OAuth2Service);
    });

    afterEach(() => {
        httpTestingController.verify();
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});