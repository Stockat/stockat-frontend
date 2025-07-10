import { Component, OnInit, ViewChild } from '@angular/core';
import { CategoryDto } from '../../../core/models/category-models/categoryDto';
import { CategoryService } from '../../../core/services/category.service';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ToastModule,
    CardModule,
    BadgeModule,
    FormsModule,
    CommonModule,
    Tooltip,
    InputTextModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
  ],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css',
  providers: [MessageService, ConfirmationService],
})
export class CategoryManagementComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  categories: CategoryDto[] = [];
  filteredCategories: CategoryDto[] = [];
  loading = false;
  globalFilter: string = '';
  statusFilter: string = 'all'; // 'all', 'active', 'deleted'

  // Dialog properties
  displayAddDialog = false;
  displayEditDialog = false;
  selectedCategory: CategoryDto | null = null;
  newCategoryName = '';
  editCategoryName = '';

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading = true;
    this.categoryService.getAllCategoriesforAdmin().subscribe({
      next: (res) => {
        console.log(res);
        this.categories = res.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch categories.',
        });
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.filteredCategories = this.categories.filter((category) => {
      // Status filter
      if (this.statusFilter === 'active' && category.isDeleted) {
        return false;
      }
      if (this.statusFilter === 'deleted' && !category.isDeleted) {
        return false;
      }
      return true;
    });
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  showAddDialog() {
    this.newCategoryName = '';
    this.displayAddDialog = true;
  }

  showEditDialog(category: CategoryDto) {
    this.selectedCategory = category;
    this.editCategoryName = category.categoryName;
    this.displayEditDialog = true;
  }

  addCategory() {
    if (!this.newCategoryName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Category name is required.',
      });
      return;
    }

    console.log(this.newCategoryName.trim());
    this.loading = true;
    this.categoryService.addCategory(this.newCategoryName.trim()).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Category added successfully.',
        });
        this.displayAddDialog = false;
        this.fetchCategories();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add category.',
        });
        this.loading = false;
      },
    });
  }

  editCategory() {
    if (!this.selectedCategory || !this.editCategoryName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Category name is required.',
      });
      return;
    }

    const updatedCategory: CategoryDto = {
      id: this.selectedCategory.id,
      categoryName: this.editCategoryName.trim(),
    };

    this.loading = true;
    this.categoryService
      .editCategory(this.selectedCategory.id, updatedCategory)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category updated successfully.',
          });
          this.displayEditDialog = false;
          this.fetchCategories();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update category.',
          });
          this.loading = false;
        },
      });
  }

  confirmDelete(category: CategoryDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the category "${category.categoryName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteCategory(category.id);
      },
    });
  }

  deleteCategory(id: number) {
    this.loading = true;
    this.categoryService.deleteCategory(id).subscribe({
      next: (res) => {
        if (res.status==200) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
            detail: 'Category deleted successfully.',
          });

        }else{
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: res.message,
          });
        }
        this.fetchCategories();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete category.',
        });
        this.loading = false;
      },
    });
  }

  clearFilters() {
    this.globalFilter = '';
    this.statusFilter = 'all';
    if (this.dt) {
      this.dt.filterGlobal('', 'contains');
    }
    this.applyFilters();
  }

  refreshData() {
    this.fetchCategories();
  }

  get activeCategoriesCount(): number {
    return this.categories.filter((c) => !c.isDeleted).length;
  }

  get deletedCategoriesCount(): number {
    return this.categories.filter((c) => c.isDeleted).length;
  }

  get filteredCategoriesCount(): number {
    return this.filteredCategories.length;
  }
}
