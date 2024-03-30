import { Component, OnInit } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'quiz',
    standalone: true,
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'],
    imports: [PanelModule, FormsModule, CardModule, ButtonModule, RadioButtonModule]
})
export class QuizComponent implements OnInit {
    questions = [
        { id: 1, text: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' },
        { id: 2, text: 'What is 2 + 3?', options: ['3', '4', '5'], answer: '5' },
        { id: 3, text: 'What is 2 - (-1)?', options: ['3', '4', '5'], answer: '3' }
        // Add more questions as needed
    ];

    selectedOptions: { [key: number]: string } = {};

    constructor() { }

    ngOnInit(): void {

    }

    submit() {
        let score = 0;
        for (const question of this.questions) {
            if (this.selectedOptions[question.id] === question.answer) {
                score++;
            }
        }
        alert('Your score is: ' + score);
    }
}
