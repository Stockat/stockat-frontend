import { Component, OnInit } from '@angular/core';
import { ServiceRequestService } from '../../../../core/services/service-request.service';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { CompactNumberPipe } from '../../../../shared/pipes/compact-number.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './service-analytics.component.html',
  styleUrls: ['./service-analytics.component.css'],
  imports: [CommonModule, ChartModule, CompactNumberPipe]
})
export class ServiceAnalyticsComponent implements OnInit {
  statusChartData: any;
  statusChartOptions: any;

  trendChartData: any;
  trendChartOptions: any;

  revenue: any = {};
  topServicesChartData: any;
  topServicesChartOptions: any;

  // New analytics data
  conversionFunnelData: any;
  conversionFunnelOptions: any;
  serviceReviews: any = {};
  topCustomers: any[] = [];
  customerDemographics: any = {};

  loading = true;

  constructor(public serviceRequestService: ServiceRequestService) {}

  ngOnInit(): void {
    this.loading = true;

    // Status Breakdown (Pie)
    this.serviceRequestService.getSellerStatusBreakdown().subscribe({
      next: (data: any) => {
        this.statusChartData = {
          labels: data.map((s: any) => s.status),
          datasets: [{
            data: data.map((s: any) => s.count),
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
          }]
        };
        this.statusChartOptions = {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Monthly Trend (Line)
    this.serviceRequestService.getSellerMonthlyTrend().subscribe({
      next: (data: any) => {
        const labels = data.map((m: any) => `${m.year}/${m.month}`);
        this.trendChartData = {
          labels,
          datasets: [{
            label: 'Requests',
            data: data.map((m: any) => m.count),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          }]
        };
        this.trendChartOptions = {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Revenue (KPI)
    this.serviceRequestService.getSellerRevenue().subscribe({
      next: (data: any) => {
        this.revenue = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Top Services (Bar)
    this.serviceRequestService.getSellerTopServices().subscribe({
      next: (data: any) => {
        this.topServicesChartData = {
          labels: data.map((t: any) => t.serviceName),
          datasets: [{
            label: 'Requests',
            data: data.map((t: any) => t.requestCount),
            backgroundColor: '#66BB6A'
          }]
        };
        this.topServicesChartOptions = {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Conversion Funnel
    this.serviceRequestService.getSellerConversionFunnel().subscribe({
      next: (data: any) => {
        this.conversionFunnelData = {
          labels: ['Pending', 'In Progress', 'Ready', 'Delivered', 'Cancelled'],
          datasets: [{
            label: 'Requests',
            data: [data.pending, data.inProgress, data.ready, data.delivered, data.cancelled],
            backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#4CAF50', '#EF5350']
          }]
        };
        this.conversionFunnelOptions = {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Service Reviews
    this.serviceRequestService.getSellerServiceReviews().subscribe({
      next: (data: any) => {
        this.serviceReviews = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Top Customers
    this.serviceRequestService.getSellerTopCustomers().subscribe({
      next: (data: any) => {
        this.topCustomers = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });

    // Customer Demographics
    this.serviceRequestService.getSellerCustomerDemographics().subscribe({
      next: (data: any) => {
        this.customerDemographics = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }
}
