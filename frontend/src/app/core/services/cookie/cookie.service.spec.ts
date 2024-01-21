import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie.service';

const MOCK_COOKIES = [
    {
        "name": "test_cookie",
        "value": 50
    },
    {
        "name": "test_cookie_2",
        "value": 'Chocolate chip cookies found here'
    },
];


describe('CookieService', () => {
    let service: CookieService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CookieService);
    });

    afterAll(() => {
        service.deleteAll();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be able to set a cookie', () => {
        service.set(MOCK_COOKIES[0].name, MOCK_COOKIES[0].value, 1);

        expect(service.get(MOCK_COOKIES[0].name)).toBe('' + MOCK_COOKIES[0].value);
    });

    it('should be able to set multiple cookies', () => {
        MOCK_COOKIES.forEach((mock_cookie: any) => {
            service.set(mock_cookie.name, mock_cookie.value, 1);
        });

        MOCK_COOKIES.forEach((mock_cookie: any) => {
            expect(service.get(mock_cookie.name)).toBe('' + mock_cookie.value);
        });
    });

    it('should be able to get all cookies', () => {
        MOCK_COOKIES.forEach((mock_cookie: any) => {
            service.set(mock_cookie.name, mock_cookie.value, 1);
        });
        const SET_COOKIES = service.getAll();

        expect(MOCK_COOKIES.length).toBe(SET_COOKIES.length);
        MOCK_COOKIES.forEach((mock_cookie, index) => {
            expect(mock_cookie.name).toBe(SET_COOKIES[index].name);
            expect('' + mock_cookie.value).toBe('' + SET_COOKIES[index].value);
        });
    });

    it('should be able to update a cookie value', () => {
        service.set(MOCK_COOKIES[0].name, MOCK_COOKIES[0].value, 1);
        expect(service.get(MOCK_COOKIES[0].name)).toBe('' + MOCK_COOKIES[0].value);

        service.set(MOCK_COOKIES[0].name, MOCK_COOKIES[1].value, 1);
        expect(service.get(MOCK_COOKIES[0].name)).toBe('' + MOCK_COOKIES[1].value);
    });

    it('should be able to delete a cookie', () => {
        service.set(MOCK_COOKIES[0].name, MOCK_COOKIES[0].value, 1);
        expect(service.get(MOCK_COOKIES[0].name)).toBe('' + MOCK_COOKIES[0].value);

        service.delete(MOCK_COOKIES[0].name);
        expect(service.get(MOCK_COOKIES[0].name)).toBe(null);
    });

    it('should be able to delete all cookies', () => {
        MOCK_COOKIES.forEach(mock_cookie => {
            service.set(mock_cookie.name, mock_cookie.value, 1);
        });

        service.deleteAll();

        MOCK_COOKIES.forEach(mock_cookie => {
            expect(service.get(mock_cookie.name)).toBe(null);
        });
    });

});