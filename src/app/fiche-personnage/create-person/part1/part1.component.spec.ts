import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Part1Component } from './part1.component';

describe('Part1IdentityComponent', () => {
  let component: Part1Component;
  let fixture: ComponentFixture<Part1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Part1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Part1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
