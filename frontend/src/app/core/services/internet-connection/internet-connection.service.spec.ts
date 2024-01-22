import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { InternetConnectionService } from "./internet-connection.service";

describe('InternetConnectionService', () => {
    let service: InternetConnectionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InternetConnectionService);
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initially return the correct status', () => {
        const initialStatus = service.isOnline();
        const online = window.navigator.onLine; // Grab the correct status from the browser api
        expect(initialStatus).toBe(online);
    });

    it('should show online when the online event is triggered', () => {
        const onlineEvent = new Event('online');
        window.dispatchEvent(onlineEvent);

        const onlineStatus = service.isOnline();
        expect(onlineStatus).toBe(true);

    });

    it('should show offline when the offline event is triggered', () => {
        const onlineEvent = new Event('offline');
        window.dispatchEvent(onlineEvent);

        const onlineStatus = service.isOnline();
        expect(onlineStatus).toBe(false);

    });

    it('should observe changes in connection status', fakeAsync(() => {
        window.dispatchEvent(new Event('online'));
        tick();
        expect(service.isOnline()).toBe(true);

        window.dispatchEvent(new Event('offline'));
        tick();
        expect(service.isOnline()).toBe(false);

        window.dispatchEvent(new Event('online'));
        tick();
        expect(service.isOnline()).toBe(true);

        window.dispatchEvent(new Event('offline'));
        tick();
        expect(service.isOnline()).toBe(false);
    }));
});