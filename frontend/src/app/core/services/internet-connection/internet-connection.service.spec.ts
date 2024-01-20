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
        const initialStatus = service.getConnectionStatus();
        const online = window.navigator.onLine; // Grab the correct status from the browser api
        expect(initialStatus).toBe(online);
    });

    it('should show online when the online event is triggered', () => {
        const onlineEvent = new Event('online');
        window.dispatchEvent(onlineEvent);

        const onlineStatus = service.getConnectionStatus();
        expect(onlineStatus).toBe(true);

    });

    it('should show offline when the offline event is triggered', () => {
        const onlineEvent = new Event('offline');
        window.dispatchEvent(onlineEvent);

        const onlineStatus = service.getConnectionStatus();
        expect(onlineStatus).toBe(false);

    });


});