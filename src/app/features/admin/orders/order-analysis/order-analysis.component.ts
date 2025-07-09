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
import { OrderService } from '../../../../core/services/order.service';
import {
  OrderType,
  OrderStatus,
  ReportMetricType,
  Time,
} from '../../../../core/models/order-models/AnalysisDto';

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

  // Donut Chart Parameters
  data1: any;
  options1: any;
  data2: any;
  options2: any;

  DonutValues1: [number, number, number, number] = [0, 0, 0, 0];
  DonutValues2: [number, number] = [0, 0];
  // Order summary counts (placeholders)
  pendingCount = 0;
  processingCount = 0;
  readyCount = 0;
  shippedCount = 0;
  deliveredCount = 0;
  cancelledCount = 0;
  pendingSellerCount = 0;
  pendingBuyerCount = 0;

  // Payment status counts for chart
  pendingPaymentCount = 0;
  paidPaymentCount = 0;
  failedPaymentCount = 0;
  refundedPaymentCount = 0;

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
  metricType: string = 'count';
  metricTypeOptions = [
    { label: 'Count', value: 'count' },
    { label: 'Revenue', value: 'revenue' },
  ];
  time: Time = Time.Monthly;
  timeOptions = [
    { label: 'Yearly', value: Time.Yearly },
    { label: 'Monthly', value: Time.Monthly },
    { label: 'Weekly', value: Time.Weekly },
  ];

  private orderStatusOptions: { label: string; value: string }[] = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  private requestStatusOptions: { label: string; value: string }[] = [
    { label: 'Pending Seller', value: 'PendingSeller' },
    { label: 'Pending Buyer', value: 'PendingBuyer' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Shipped', value: 'Shipped' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  // Remove enum mapping objects

  platformId = inject(PLATFORM_ID);

  @ViewChild('monthlyBarChart') monthlyBarChartComp!: UIChart;
  @ViewChild('statusBarChart') statusBarChartComp!: UIChart;
  @ViewChild('pieChart1') pieChart1Comp!: UIChart;
  @ViewChild('pieChart2') pieChart2Comp!: UIChart;

  // Applied filter values for header
  appliedTime: Time = Time.Monthly;
  appliedOrderType: string = '';
  appliedMetricType: string = 'count';
  appliedStatus: string = '';

  constructor(private cd: ChangeDetectorRef, private orderServ: OrderService) {}

  ngOnInit() {
    this.getOrderSales();
    this.getOrdersRequestBarChartValues();
    this.getOrderPaymentData();
    this.initChartbar1();
    this.initPaymentStatusDonut();
    this.initOrderTypeDonut();
    this.updateStatusOptions();
  }

  updateStatusOptions() {
    if (this.orderTypeFilter === 'Order') {
      this.statusOptions = [
        { label: 'All Status', value: '' },
        ...this.orderStatusOptions,
      ];
    } else if (this.orderTypeFilter === 'Request') {
      this.statusOptions = [
        { label: 'All Status', value: '' },
        ...this.requestStatusOptions,
      ];
    } else {
      // Intersection of both
      const intersection = this.orderStatusOptions.filter(
        (os: { label: string; value: string }) =>
          this.requestStatusOptions.some(
            (rs: { label: string; value: string }) => rs.value === os.value
          )
      );
      this.statusOptions = [
        { label: 'All Status', value: '' },
        ...intersection,
      ];
    }
    // Reset status filter if current value is not in the new options
    if (!this.statusOptions.some((opt) => opt.value === this.statusFilter)) {
      this.statusFilter = '';
    }
  }

  onOrderTypeChange() {
    this.updateStatusOptions();
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

  updateBarChart(labels: string[], values: number[]) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue(
        '--p-text-muted-color'
      );
      const surfaceBorder = documentStyle.getPropertyValue(
        '--p-content-border-color'
      );
      const maxValue = Math.max(...values);
      const deepColor = '#2563eb'; // blue-600
      const lightColor = 'rgba(37, 99, 235, 0.2)'; // light blue
      this.basicData = {
        labels: labels,
        datasets: [
          {
            label: 'Sales',
            data: values,
            backgroundColor: values.map((value) =>
              value === maxValue ? deepColor : lightColor
            ),
            borderColor: values.map((value) =>
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

  getOrderPaymentData() {
    let mappedOrderType: OrderType | '' = '';
    let mappedMetricType: ReportMetricType = ReportMetricType.Count;

    if (this.orderTypeFilter === 'Order') mappedOrderType = OrderType.Order;
    else if (this.orderTypeFilter === 'Request')
      mappedOrderType = OrderType.Request;
    else mappedOrderType = '';

    mappedMetricType =
      this.metricType === 'revenue'
        ? ReportMetricType.Revenue
        : ReportMetricType.Count;

    this.orderServ
      .getorderPayment({
        type: mappedOrderType as OrderType,
        status: '' as any, // Payment analysis doesn't use status filter
        metricType: mappedMetricType as ReportMetricType,
        time: this.time,
      })
      .subscribe({
        next: (res) => {
          console.log('Payment data:', res);
          // The response should be BarChartAnalysisDto structure
          if (res.data && res.data.labels && res.data.values) {
            this.updatePaymentStatusDonut(res.data.labels, res.data.values);
          } else {
            console.error('Unexpected response structure:', res.data);
          }
        },
        error: (err) => {
          console.log('Error getting payment data:', err);
        },
      });
  }

  updatePaymentStatusDonut(labels: string[], values: number[]) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor =
        documentStyle.getPropertyValue('--p-text-color') || '#374151';
      const legendFontSize = 16;
      const legendFontWeight = 'bold';

      // Define color palette for payment statuses
      const palette = [
        '#fbbf24', // yellow (Pending)
        '#22c55e', // green (Paid)
        '#ef4444', // red (Failed)
        '#6366f1', // indigo (Refunded)
        '#8b5cf6', // purple (Other)
      ];
      const hoverPalette = [
        '#f59e42', // darker yellow
        '#16a34a', // darker green
        '#b91c1c', // darker red
        '#3730a3', // darker indigo
        '#7c3aed', // darker purple
      ];

      this.data1 = {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: palette.slice(0, labels.length),
            hoverBackgroundColor: hoverPalette.slice(0, labels.length),
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      };
      this.options1 = {
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: legendFontSize,
                weight: legendFontWeight,
              },
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: palette[0],
            bodyColor: textColor,
            borderColor: palette[0],
            borderWidth: 1,
            padding: 12,
            caretSize: 8,
            cornerRadius: 8,
            titleFont: { size: 16, weight: 'bold' },
            bodyFont: { size: 14 },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      };
      this.cd.markForCheck();
    }
  }

  // First donut: Orders by Payment Status
  initPaymentStatusDonut() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor =
        documentStyle.getPropertyValue('--p-text-color') || '#374151';
      const legendFontSize = 16;
      const legendFontWeight = 'bold';
      const palette = [
        '#fbbf24', // yellow (Pending)
        '#22c55e', // green (Paid)
        '#ef4444', // red (Failed)
        '#6366f1', // indigo (Refunded)
      ];
      const hoverPalette = [
        '#f59e42', // darker yellow
        '#16a34a', // darker green
        '#b91c1c', // darker red
        '#3730a3', // darker indigo
      ];
      this.data1 = {
        labels: ['Pending', 'Paid', 'Failed', 'Refunded'],
        datasets: [
          {
            data: [0, 0, 0, 0], // Initialize with zeros, will be updated by getOrderPaymentData
            backgroundColor: palette,
            hoverBackgroundColor: hoverPalette,
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      };
      this.options1 = {
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: legendFontSize,
                weight: legendFontWeight,
              },
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: palette[0],
            bodyColor: textColor,
            borderColor: palette[0],
            borderWidth: 1,
            padding: 12,
            caretSize: 8,
            cornerRadius: 8,
            titleFont: { size: 16, weight: 'bold' },
            bodyFont: { size: 14 },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      };
      this.cd.markForCheck();
    }
  }

  // Second donut: Orders by Order Type
  initOrderTypeDonut() {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor =
        documentStyle.getPropertyValue('--p-text-color') || '#374151';
      const legendFontSize = 16;
      const legendFontWeight = 'bold';
      const palette = [
        '#2563eb', // blue (Order)
        '#f59e42', // orange (Request)
      ];
      const hoverPalette = [
        '#1d4ed8', // darker blue
        '#ea580c', // darker orange
      ];
      this.data2 = {
        labels: ['Order', 'Request'],
        datasets: [
          {
            data: this.DonutValues2,
            backgroundColor: palette,
            hoverBackgroundColor: hoverPalette,
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      };
      this.options2 = {
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: legendFontSize,
                weight: legendFontWeight,
              },
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#fff',
            titleColor: palette[0],
            bodyColor: textColor,
            borderColor: palette[0],
            borderWidth: 1,
            padding: 12,
            caretSize: 8,
            cornerRadius: 8,
            titleFont: { size: 16, weight: 'bold' },
            bodyFont: { size: 14 },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
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
    if (this.pieChart1Comp && this.pieChart1Comp.chart) {
      this.pieChart1Comp.chart.resize();
    }
    if (this.pieChart2Comp && this.pieChart2Comp.chart) {
      this.pieChart2Comp.chart.resize();
    }
  };

  getOrderSales() {
    this.orderServ.getorderSales().subscribe({
      next: (res) => {
        console.log(res);
        console.log('-------------------------------');
        this.DonutValues2 = [res.data.Order, res.data.Request];
        this.initOrderTypeDonut();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getOrdersRequestBarChartValues() {
    let mappedOrderType: OrderType | '' = '';
    let mappedStatus: OrderStatus | '' = '';
    let mappedMetricType: ReportMetricType = ReportMetricType.Count;

    if (this.orderTypeFilter === 'Order') mappedOrderType = OrderType.Order;
    else if (this.orderTypeFilter === 'Request')
      mappedOrderType = OrderType.Request;
    else mappedOrderType = '';

    // Map status string to enum if present
    switch (this.statusFilter) {
      case 'PendingSeller':
        mappedStatus = OrderStatus.PendingSeller;
        break;
      case 'PendingBuyer':
        mappedStatus = OrderStatus.PendingBuyer;
        break;
      case 'Processing':
        mappedStatus = OrderStatus.Processing;
        break;
      case 'Ready':
        mappedStatus = OrderStatus.Ready;
        break;
      case 'Pending':
        mappedStatus = OrderStatus.Pending;
        break;
      case 'Shipped':
        mappedStatus = OrderStatus.Shipped;
        break;
      case 'Completed':
        mappedStatus = OrderStatus.Completed;
        break;
      case 'Cancelled':
        mappedStatus = OrderStatus.Cancelled;
        break;
      case 'PaymentFailed':
        mappedStatus = OrderStatus.PaymentFailed;
        break;
      case 'Delivered':
        mappedStatus = OrderStatus.Delivered;
        break;
      case '':
        mappedStatus = '';
        break;
    }

    mappedMetricType =
      this.metricType === 'revenue'
        ? ReportMetricType.Revenue
        : ReportMetricType.Count;

    console.log('OrderType:', mappedOrderType);
    console.log('OrderStatus:', mappedStatus);
    console.log('MetricType:', mappedMetricType);

    this.orderServ
      .getOrdersVsStatus({
        type: mappedOrderType as OrderType,
        status: mappedStatus as OrderStatus,
        metricType: mappedMetricType as ReportMetricType,
        time: this.time,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.updateBarChart(res.data.labels, res.data.values);
        },
      });
  }

  applyFilters() {
    // Store applied filter values
    this.appliedTime = this.time;
    this.appliedOrderType = this.orderTypeFilter;
    this.appliedMetricType = this.metricType;
    this.appliedStatus = this.statusFilter;
    this.getOrdersRequestBarChartValues();
    this.getOrderPaymentData(); // Add this line to refresh payment data
    // Add any other data refresh logic if needed
  }

  clearFilters() {
    // Reset all filters to default values
    this.statusFilter = '';
    this.orderTypeFilter = '';
    this.time = Time.Monthly; // Default to monthly
    this.metricType = 'count'; // Default to count

    // Update status options based on reset order type
    this.updateStatusOptions();

    // Store applied filter values as defaults
    this.appliedTime = this.time;
    this.appliedOrderType = this.orderTypeFilter;
    this.appliedMetricType = this.metricType;
    this.appliedStatus = this.statusFilter;

    // Refresh data with default filters
    this.getOrdersRequestBarChartValues();
    this.getOrderPaymentData();
  }

  getTimeLabel(): string {
    switch (this.appliedTime) {
      case Time.Yearly:
        return 'Yearly';
      case Time.Monthly:
        return 'Monthly';
      case Time.Weekly:
        return 'Weekly';
      default:
        return '';
    }
  }

  getOrderTypeLabel(): string {
    if (this.appliedOrderType === 'Order') return 'Orders';
    if (this.appliedOrderType === 'Request') return 'Requests';
    return 'Orders';
  }

  getMetricTypeLabel(): string {
    return this.appliedMetricType === 'revenue' ? 'Revenue' : 'Count';
  }

  getStatusLabel(): string {
    if (!this.appliedStatus) return 'All';
    const found = this.statusOptions.find(
      (opt) => opt.value === this.appliedStatus
    );
    return found ? found.label : this.appliedStatus;
  }
}
