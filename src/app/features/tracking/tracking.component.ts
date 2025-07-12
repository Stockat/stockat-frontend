import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css',
  imports: [DatePipe,CommonModule,ButtonModule],
})
export class TrackingComponent implements OnDestroy {
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  driver: any = null;
  loading = false;
  error: string | null = null;
  driverId: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get driverId from query parameters
    this.route.queryParams.subscribe(params => {
      this.driverId = params['driverId'] || '85f3bb1e-f44e-4b86-9472-f15950139915';
      this.fetchDriver();
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  fetchDriver() {
    this.loading = true;
    this.error = null;
    this.http
      .get<any>(`http://localhost:5250/api/Driver/${this.driverId}`)
      .subscribe({
        next: (res) => {
          this.driver = res.data;
          this.loading = false;
          this.updateMap();
        },
        error: (err) => {
          this.error = 'Failed to fetch driver info';
          this.loading = false;
        },
      });
  }

  updateMap() {
    if (!this.driver) return;
    const lat = parseFloat(this.driver.latitude);
    const lng = parseFloat(this.driver.longitude);
    if (!this.map) {
      this.map = L.map('map').setView([lat, lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(this.map);
    } else {
      this.map.setView([lat, lng], 13);
    }
    // Remove old marker if exists
    if (this.marker) {
      this.marker.remove();
    }
    // Custom pulsing icon
    const pulsingIcon = L.divIcon({
      className: 'pulsing-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      html: `<i class="pi pi-spin pi-times-circle" style="color:rgb(204, 0, 0); font-size: 24px;"></i>`,
    });
    this.marker = L.marker([lat, lng], { icon: pulsingIcon })
      .addTo(this.map)
      .bindPopup(
        `<b>${this.driver.name}</b><br>${this.driver.carType} - ${this.driver.carPlate}`
      );
  }

  refresh() {
    this.fetchDriver();
  }
}
