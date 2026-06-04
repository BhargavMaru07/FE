import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneEditDialog } from './zone-edit-dialog';

describe('ZoneEditDialog', () => {
  let component: ZoneEditDialog;
  let fixture: ComponentFixture<ZoneEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
