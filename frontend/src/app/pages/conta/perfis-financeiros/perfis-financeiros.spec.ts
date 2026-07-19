import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfisFinanceiros } from './perfis-financeiros';

describe('PerfisFinanceiros', () => {
  let component: PerfisFinanceiros;
  let fixture: ComponentFixture<PerfisFinanceiros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfisFinanceiros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfisFinanceiros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
