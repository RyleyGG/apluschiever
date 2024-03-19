import { TestBed } from '@angular/core/testing';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should save current state', () => {
        const state = { prop1: 'value1', prop2: 'value2' };
        service.saveCurrentState(state);
        expect(service['undoStack']).toEqual([state]);
        expect(service['redoStack']).toEqual([]);
    });

    it('should undo', () => {
        const initialState = { prop1: 'initialValue1', prop2: 'initialValue2' };
        const stateToUndo = { prop1: 'value1', prop2: 'value2' };
        service.saveCurrentState(initialState);
        service.saveCurrentState(stateToUndo);
        expect(service.undo()).toEqual(initialState);
        expect(service['undoStack']).toEqual([initialState]);
        expect(service['redoStack']).toEqual([stateToUndo]);
    });

    it('should return undefined when undo stack is empty', () => {
        expect(service.undo()).toBeUndefined();
    });

    it('should redo', () => {
        const initialState = { prop1: 'initialValue1', prop2: 'initialValue2' };
        const stateToRedo = { prop1: 'value1', prop2: 'value2' };
        service.saveCurrentState(initialState);
        service.saveCurrentState(stateToRedo);
        service.undo();
        expect(service.redo()).toEqual(stateToRedo);
        expect(service['undoStack']).toEqual([initialState, stateToRedo]);
        expect(service['redoStack']).toEqual([]);
    });

    it('should return undefined when redo stack is empty', () => {
        expect(service.redo()).toBeUndefined();
    });
});
