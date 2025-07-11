import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAnalyticsComponent } from './service-analytics.component';

describe('ServiceAnalyticsComponent', () => {
  let component: ServiceAnalyticsComponent;
  let fixture: ComponentFixture<ServiceAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAnalyticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
