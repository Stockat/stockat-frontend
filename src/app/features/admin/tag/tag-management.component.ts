import { Component, OnInit, ViewChild } from '@angular/core';
import { tagdto } from '../../../core/models/tag-models/tagDto';
import { TagService } from '../../../core/services/tag.service';
import { UpdateTagDto } from '../../../core/models/tag-models/update-tag.dto';
import { TagStatus } from '../../../core/models/tag-models/tag-status.enum';
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
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-tag-management',
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
    DropdownModule,
  ],
  templateUrl: './tag-management.component.html',
  styleUrl: './tag-management.component.css',
  providers: [MessageService, ConfirmationService],
})
export class TagManagementComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  tags: tagdto[] = [];
  filteredTags: tagdto[] = [];
  loading = false;
  globalFilter: string = '';
  statusFilter: string = 'all'; // 'all', 'activated', 'deactivated'

  // Dialog properties
  displayAddDialog = false;
  displayEditDialog = false;
  selectedTag: tagdto | null = null;
  newTagName = '';
  editTagName = '';

  // Tag status options
  tagStatusOptions = [
    { label: 'Activated', value: TagStatus.Activated },
    { label: 'Deactivated', value: TagStatus.Deactivated },
  ];

  // Expose TagStatus enum to template
  TagStatus = TagStatus;

  constructor(
    private tagService: TagService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.fetchTags();
  }

  fetchTags() {
    this.loading = true;
    this.tagService.getAllTagsForAdmin().subscribe({
      next: (res) => {
        console.log(res);
        this.tags = res.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch tags.',
        });
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.filteredTags = this.tags.filter((tag) => {
      // Status filter
      if (
        this.statusFilter === 'activated' &&
        tag.status !== TagStatus.Activated
      ) {
        return false;
      }
      if (
        this.statusFilter === 'deactivated' &&
        tag.status !== TagStatus.Deactivated
      ) {
        return false;
      }
      return true;
    });
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  showAddDialog() {
    this.newTagName = '';
    this.displayAddDialog = true;
  }

  showEditDialog(tag: tagdto) {
    this.selectedTag = tag;
    this.editTagName = tag.name;
    this.displayEditDialog = true;
  }

  addTag() {
    if (!this.newTagName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Tag name is required.',
      });
      return;
    }

    console.log(this.newTagName.trim());
    this.loading = true;
    this.tagService.addTag(this.newTagName.trim()).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag added successfully.',
        });
        this.displayAddDialog = false;
        this.fetchTags();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add tag.',
        });
        this.loading = false;
      },
    });
  }

  editTag() {
    if (!this.selectedTag || !this.editTagName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Tag name is required.',
      });
      return;
    }

    const updateTagDto: UpdateTagDto = {
      tagName: this.editTagName.trim(),
      tagId: this.selectedTag.id,
    };

    this.loading = true;
    this.tagService.editTag(this.selectedTag.id, updateTagDto).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag updated successfully.',
        });
        this.displayEditDialog = false;
        this.fetchTags();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update tag.',
        });
        this.loading = false;
      },
    });
  }

  changeTagStatus(tag: tagdto, newStatus: TagStatus) {
    console.log(tag);
    console.log(newStatus);
    this.loading = true;
    this.tagService.changeTagStatus(tag.id, newStatus).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Tag status changed to ${newStatus} successfully.`,
        });
        this.fetchTags();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to change tag status.',
        });
        this.loading = false;
      },
    });
  }

  confirmDelete(tag: tagdto) {
    console.log(tag);
    this.confirmationService.confirm({
      message: `Are you sure you want to Deactivate the tag "${tag.name}"?`,
      header: 'Deactivate Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.changeTagStatus(tag, TagStatus.Deactivated);
      },
    });
  }

  clearFilters() {
    this.globalFilter = '';
    this.statusFilter = 'all';
    this.dt.filterGlobal('', 'contains');
    this.applyFilters();
  }

  refreshData() {
    this.fetchTags();
  }

  get activatedTagsCount(): number {
    return this.tags.filter((tag) => tag.status === TagStatus.Activated).length;
  }

  get deactivatedTagsCount(): number {
    return this.tags.filter((tag) => tag.status === TagStatus.Deactivated)
      .length;
  }

  get filteredTagsCount(): number {
    return this.filteredTags.length;
  }
}
