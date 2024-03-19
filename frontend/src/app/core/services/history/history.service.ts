import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private undoStack: any[] = [];
    private redoStack: any[] = [];

    constructor() { }

    saveCurrentState(state: any) {
        this.undoStack.push({ ...state });
        // Clear the redo stack when a new state is saved
        this.redoStack = [];
    }

    undo(): any {
        if (this.undoStack.length > 0) {
            const prevState = this.undoStack.pop(); // Pop the current state
            this.redoStack.push({ ...prevState }); // Push the popped state to redo stack
        }
        return this.undoStack[this.undoStack.length - 1];
    }

    redo(): any {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop(); // Pop the next state
            this.undoStack.push({ ...nextState }); // Push the popped state to undo stack
        }
        return this.undoStack[this.undoStack.length - 1];
    }
}
