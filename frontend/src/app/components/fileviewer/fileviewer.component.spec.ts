import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileviewerComponent } from './fileviewer.component';
import { routes } from './../../app.routes';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FileviewerComponent', () => {
  let component: FileviewerComponent;
  let fixture: ComponentFixture<FileviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileviewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes)
    ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
