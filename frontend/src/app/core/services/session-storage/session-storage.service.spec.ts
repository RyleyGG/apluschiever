import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';


const MOCK_ITEMS = [
    {
        "name": "testItem",
        "value": 450
    },
    {
        "name": "test item 2",
        "value": 'This item is in session storage'
    },
];

describe('SessionStorageService', () => {
    let service: SessionStorageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SessionStorageService);
    });

    afterAll(() => {
        service.deleteAll();
    });

    it('should be able to set an item in session storage', () => {
        service.set(MOCK_ITEMS[0].name, MOCK_ITEMS[0].value);
        expect(service.get(MOCK_ITEMS[0].name)).toBe('' + MOCK_ITEMS[0].value);
    });

    it('should be able to set multiple items in session storage', () => {
        MOCK_ITEMS.forEach(mock_item => {
            service.set(mock_item.name, mock_item.value);
        });

        MOCK_ITEMS.forEach(mock_item => {
            expect(service.get(mock_item.name)).toBe('' + mock_item.value);
        });
    });

    it('should be able to get all items in session storage', () => {
        MOCK_ITEMS.forEach((mock_item: any) => {
            service.set(mock_item.name, mock_item.value);
        });
        const SET_ITEMS = service.getAll().sort();

        // Modify the below because we set with number but storage returns in string form
        const EXPECTED_ITEMS = MOCK_ITEMS;
        EXPECTED_ITEMS.forEach(item => item.value = item.value + '');

        expect(SET_ITEMS.length).toBe(EXPECTED_ITEMS.length);
        expect(SET_ITEMS).toEqual(jasmine.arrayWithExactContents(EXPECTED_ITEMS));
    });

    it('should be able to overwrite an item in session storage', () => {
        service.set(MOCK_ITEMS[0].name, MOCK_ITEMS[0].value);
        expect(service.get(MOCK_ITEMS[0].name)).toBe('' + MOCK_ITEMS[0].value);

        service.set(MOCK_ITEMS[0].name, MOCK_ITEMS[1].value);
        expect(service.get(MOCK_ITEMS[0].name)).toBe('' + MOCK_ITEMS[1].value);
    });

    it('should be able to remove an item in session storage', () => {
        service.set(MOCK_ITEMS[0].name, MOCK_ITEMS[0].value);
        expect(service.get(MOCK_ITEMS[0].name)).toBe('' + MOCK_ITEMS[0].value);

        service.delete(MOCK_ITEMS[0].name);
        expect(service.get(MOCK_ITEMS[0].name)).toBe(null);
    });

    it('should be able to clear the session storage', () => {
        MOCK_ITEMS.forEach(mock_item => {
            service.set(mock_item.name, mock_item.value);
        });

        service.deleteAll();

        MOCK_ITEMS.forEach(mock_item => {
            expect(service.get(mock_item.name)).toBe(null);
        });
    });
});