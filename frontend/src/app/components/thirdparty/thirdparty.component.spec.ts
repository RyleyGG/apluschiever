import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdpartyComponent } from './thirdparty.component';

describe('ThirdpartyComponent', () => {
  let component: ThirdpartyComponent;
  let fixture: ComponentFixture<ThirdpartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdpartyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThirdpartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
