import { Component, Input, OnInit } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'quiz',
    standalone: true,
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'],
    imports: [PanelModule, CommonModule, FormsModule, CardModule, ButtonModule, CheckboxModule]
})
export class QuizComponent implements OnInit {
    @Input() questions: { question_text: string, point_value: number, options: string[], answer: string[] }[] = [];
    selectedOptions: { [key: string]: string[] } = {};
    submitted: boolean = false;

    constructor() { }

    ngOnInit(): void { }

    reset(form: NgForm) {
        this.submitted = false;
        form.resetForm();
    }

    submit() {
        console.log(this.questions);
        console.log(this.selectedOptions);
        let score = this.calculateScore();
        this.submitted = true;
        console.log(score);
    }

    private calculateScore = () => {
        let totalPoints = 0;
        let earnedPoints = 0;

        this.questions.forEach((question: { question_text: string, point_value: number, options: string[], answer: string[] }) => {
            const selected = this.selectedOptions[question.question_text] || [];
            const correctSelected = question.answer.every(answer => selected.includes(answer));
            if (correctSelected) { earnedPoints += question.point_value; }
            totalPoints += question.point_value;
        });

        return (earnedPoints / totalPoints) * 100;
    }
}