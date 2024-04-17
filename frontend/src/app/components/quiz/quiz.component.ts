import { Component, Input, OnInit, ViewChild, ElementRef} from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'quiz',
    standalone: true,
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.css'],
    imports: [PanelModule, ReactiveFormsModule, CommonModule, FormsModule, CardModule, ButtonModule, CheckboxModule]
})
export class QuizComponent {
    @ViewChild('myForm') myForm: NgForm | any;
    @Input() questions: { question_text: string, point_value: number, options: string[], answer: string[] }[] = [];
    selectedOptions: { [key: string]: string[] } = {};
    feedback: any[] = [];
    submitted: boolean = false;
    notSubmitted = true;
    score: any = 0;
    constructor(private el: ElementRef) { }

    reset() {
        this.submitted = false;
        this.notSubmitted = true;
        this.feedback = [];
        this.myForm.resetForm();
    }

    submit() {
        this.score = this.calculateScore();
        this.submitted = true;
    }
    isThisOption(question: any, value: string) {
        if (this.selectedOptions[question]) {
            return this.selectedOptions[question].indexOf(value) !== -1;
        }
        return false;
    }
    private calculateScore = () => {
        let totalPoints = 0;
        let earnedPoints = 0;

        this.questions.forEach((question: { question_text: string, point_value: number, options: string[], answer: string[] }) => {
            const selected = this.selectedOptions[question.question_text] || [];
            
            var correct = false;
            if (JSON.stringify(question.answer) == JSON.stringify(selected)) {
                correct = true;
                earnedPoints += question.point_value;
            }
            totalPoints += question.point_value;
            console.log(question);
            this.feedback.push({ 'answer': question.answer, 'correct': correct});
            console.log(this.feedback);
        
        });
        return (earnedPoints / totalPoints) * 100;
    }
}