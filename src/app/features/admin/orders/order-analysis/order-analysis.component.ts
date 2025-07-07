import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-order-analysis',
  imports: [
    ChartModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
  ],
  templateUrl: './order-analysis.component.html',
  styleUrl: './order-analysis.component.css',
})
export class OrderAnalysisComponent {
  //* Bar Chart Parameters
  basicData: any;
  basicOptions: any;

  //* Donut Chart Parameters
  data: any;
  options: any;

  // Order summary counts (placeholders)
  pendingCount = 0;
  processingCount = 0;
  readyCount = 0;
  shippedCount = 0;
  deliveredCount = 0;
  cancelledCount = 0;
  pendingSellerCount = 0;
  pendingBuyerCount = 0;

  // Filter options and values (placeholders)
  statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Delivered', value: 'Delivered' },
  ];
  orderTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Order', value: 'Order' },
    { label: 'Request', value: 'Request' },
  ];
  statusFilter = '';
  orderTypeFilter = '';
  globalFilter = '';

  platformId = inject(PLATFORM_ID);

  @ViewChild('monthlyBarChart') monthlyBarChartComp!: UIChart;
  @ViewChild('statusBarChart') statusBarChartComp!: UIChart;
  @ViewChild('pieChart') pieChartComp!: UIChart;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.initChartbar1();
    this.initChartDonut();
  }

  initChartbar1() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );

      // Sample data for demonstration
      const data = [540, 325, 702, 620, 450, 380, 290, 410, 520, 480];
      const labels = [
        'Q1',
        'Q2',
        'Q3',
        'Q4',
        'Q5',
        'Q6',
        'Q7',
        'Q8',
        'Q9',
        'Q10',
      ];

      // Find the maximum value
      const maxValue = Math.max(...data);

      // Define deep and light colors
      const deepColor = '#2563eb'; // blue-600
      const lightColor = 'rgba(37, 99, 235, 0.2)'; // light blue

      this.basicData = {
        labels: labels,
        datasets: [
          {
            label: 'Sales',
            data: data,
            backgroundColor: data.map((value) =>
              value === maxValue ? deepColor : lightColor
            ),
            borderColor: data.map((value) =>
              value === maxValue ? deepColor : deepColor
            ),
            borderWidth: 1,
          },
        ],
      };

      this.basicOptions = {
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: true,
      };
      this.cd.markForCheck();
    }
  }

  initChartDonut() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      this.data = {
        labels: ['A', 'B', 'C'],
        datasets: [
          {
            data: [540, 325, 702],
            backgroundColor: [
              documentStyle.getPropertyValue('--p-cyan-500'),
              documentStyle.getPropertyValue('--p-orange-500'),
              documentStyle.getPropertyValue('--p-gray-500'),
            ],
            hoverBackgroundColor: [
              documentStyle.getPropertyValue('--p-cyan-400'),
              documentStyle.getPropertyValue('--p-orange-400'),
              documentStyle.getPropertyValue('--p-gray-400'),
            ],
          },
        ],
      };

      this.options = {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              color: textColor,
            },
          },
        },
      };
      this.cd.markForCheck();
    }
  }

  // Listen for window resize and trigger chart resize for all chart instances
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.handleResizeCharts);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.handleResizeCharts);
    }
  }

  handleResizeCharts = () => {
    // Dynamically resize all chart instances
    if (this.monthlyBarChartComp && this.monthlyBarChartComp.chart) {
      this.monthlyBarChartComp.chart.resize();
    }
    if (this.statusBarChartComp && this.statusBarChartComp.chart) {
      this.statusBarChartComp.chart.resize();
    }
    if (this.pieChartComp && this.pieChartComp.chart) {
      this.pieChartComp.chart.resize();
    }
  };
}
