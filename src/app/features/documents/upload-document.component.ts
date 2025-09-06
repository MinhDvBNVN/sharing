import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { DocumentService, DocumentMetadata } from '../../core/services/document.service';

@Component({
  selector: 'app-upload-document',
  template: `
    <div class="upload-container">
      <mat-card class="upload-card">
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>cloud_upload</mat-icon>
          </div>
          <mat-card-title>Upload Document</mat-card-title>
          <mat-card-subtitle>Share knowledge with your team</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="upload-form">
            
            <!-- File Upload Zone -->
            <div class="form-section">
              <h3 class="section-title">Select File</h3>
              <ngx-dropzone 
                class="dropzone"
                [accept]="acceptedFileTypes"
                [maxFileSize]="maxFileSize"
                [multiple]="false"
                (change)="onFileSelect($event)">
                
                @if (!selectedFile()) {
                  <ngx-dropzone-label>
                    <div class="dropzone-content">
                      <mat-icon class="upload-icon">cloud_upload</mat-icon>
                      <p class="dropzone-text">
                        Drop your file here or click to browse
                      </p>
                      <p class="dropzone-hint">
                        Supported formats: PDF, DOC, DOCX, Images (max 10MB)
                      </p>
                    </div>
                  </ngx-dropzone-label>
                } @else {
                  <ngx-dropzone-preview [removable]="true" (removed)="onFileRemove()">
                    <ngx-dropzone-label>
                      <div class="file-preview">
                        <mat-icon class="file-icon">{{ getFileIcon(selectedFile()!.type) }}</mat-icon>
                        <div class="file-info">
                          <div class="file-name">{{ selectedFile()!.name }}</div>
                          <div class="file-size">{{ formatFileSize(selectedFile()!.size) }}</div>
                        </div>
                      </div>
                    </ngx-dropzone-label>
                  </ngx-dropzone-preview>
                }
              </ngx-dropzone>
              
              @if (fileError()) {
                <div class="error-message">
                  {{ fileError() }}
                </div>
              }
            </div>

            <!-- Document Information -->
            <div class="form-section">
              <h3 class="section-title">Document Information</h3>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" required>
                @if (uploadForm.get('title')?.hasError('required') && uploadForm.get('title')?.touched) {
                  <mat-error>Title is required</mat-error>
                }
                @if (uploadForm.get('title')?.hasError('maxlength')) {
                  <mat-error>Title cannot exceed 200 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Summary</mat-label>
                <textarea matInput 
                         formControlName="summary" 
                         rows="4"
                         maxlength="500"
                         required></textarea>
                <mat-hint>{{ uploadForm.get('summary')?.value?.length || 0 }}/500</mat-hint>
                @if (uploadForm.get('summary')?.hasError('required') && uploadForm.get('summary')?.touched) {
                  <mat-error>Summary is required</mat-error>
                }
                @if (uploadForm.get('summary')?.hasError('maxlength')) {
                  <mat-error>Summary cannot exceed 500 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Tags (comma separated)</mat-label>
                <input matInput formControlName="tagsInput" placeholder="e.g., documentation, tutorial, guide">
                <mat-hint>Separate tags with commas</mat-hint>
              </mat-form-field>

              @if (parsedTags().length > 0) {
                <div class="tags-preview">
                  @for (tag of parsedTags(); track $index) {
                    <mat-chip class="tag-chip">{{ tag }}</mat-chip>
                  }
                </div>
              }
            </div>

            <!-- Privacy Settings -->
            <div class="form-section">
              <h3 class="section-title">Privacy Level</h3>
              
              <mat-form-field appearance="fill" class="full-width">
                <mat-label>Who can access this document?</mat-label>
                <mat-select formControlName="privacyLevel" required>
                  <mat-option value="private">
                    <div class="privacy-option">
                      <mat-icon>lock</mat-icon>
                      <div class="privacy-info">
                        <div class="privacy-title">Private</div>
                        <div class="privacy-desc">Only you can access</div>
                      </div>
                    </div>
                  </mat-option>
                  <mat-option value="group">
                    <div class="privacy-option">
                      <mat-icon>group</mat-icon>
                      <div class="privacy-info">
                        <div class="privacy-title">Team</div>
                        <div class="privacy-desc">Your department members</div>
                      </div>
                    </div>
                  </mat-option>
                  <mat-option value="public">
                    <div class="privacy-option">
                      <mat-icon>public</mat-icon>
                      <div class="privacy-info">
                        <div class="privacy-title">Company</div>
                        <div class="privacy-desc">All company employees</div>
                      </div>
                    </div>
                  </mat-option>
                </mat-select>
                @if (uploadForm.get('privacyLevel')?.hasError('required') && uploadForm.get('privacyLevel')?.touched) {
                  <mat-error>Privacy level is required</mat-error>
                }
              </mat-form-field>
            </div>

            @if (generalError()) {
              <div class="error-message">
                {{ generalError() }}
              </div>
            }
          </form>
        </mat-card-content>

        <mat-card-actions class="card-actions">
          <button mat-button type="button" (click)="onCancel()">
            Cancel
          </button>
          
          <button mat-raised-button 
                  color="primary" 
                  type="submit"
                  (click)="onSubmit()"
                  [disabled]="!canSubmit()">
            @if (isUploading()) {
              <mat-spinner diameter="20"></mat-spinner>
              <span>Uploading...</span>
            } @else {
              <mat-icon>cloud_upload</mat-icon>
              <span>Upload Document</span>
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .upload-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .upload-card {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    
    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 500;
      color: #172b4d;
      margin: 0;
      border-bottom: 1px solid #e4e6ea;
      padding-bottom: 8px;
    }
    
    .dropzone {
      border: 2px dashed #ddd;
      border-radius: 8px;
      background-color: #fafafa;
      min-height: 200px;
      transition: all 0.2s ease;
    }
    
    .dropzone:hover {
      border-color: #0052cc;
      background-color: #f4f5f7;
    }
    
    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
    }
    
    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #6b778c;
      margin-bottom: 16px;
    }
    
    .dropzone-text {
      font-size: 16px;
      color: #172b4d;
      margin: 0 0 8px 0;
    }
    
    .dropzone-hint {
      font-size: 14px;
      color: #6b778c;
      margin: 0;
    }
    
    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #e4e6ea;
    }
    
    .file-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #0052cc;
    }
    
    .file-info {
      flex: 1;
    }
    
    .file-name {
      font-weight: 500;
      color: #172b4d;
    }
    
    .file-size {
      font-size: 14px;
      color: #6b778c;
      margin-top: 4px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .tags-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .tag-chip {
      background-color: #e4e6ea;
      color: #172b4d;
      font-size: 12px;
    }
    
    .privacy-option {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .privacy-info {
      display: flex;
      flex-direction: column;
    }
    
    .privacy-title {
      font-weight: 500;
    }
    
    .privacy-desc {
      font-size: 12px;
      color: #6b778c;
      margin-top: 2px;
    }
    
    .error-message {
      color: #de350b;
      background-color: #ffebe6;
      padding: 12px;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 24px !important;
      border-top: 1px solid #e4e6ea;
    }
    
    mat-spinner {
      margin-right: 8px;
    }
    
    @media (max-width: 768px) {
      .upload-container {
        padding: 16px;
      }
      
      .dropzone-content {
        padding: 24px 16px;
      }
      
      .card-actions {
        flex-direction: column-reverse;
      }
      
      .card-actions button {
        width: 100%;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    NgxDropzoneModule
  ]
})
export class UploadDocumentComponent implements OnInit {
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  
  protected selectedFile = signal<File | null>(null);
  protected isUploading = signal(false);
  protected fileError = signal('');
  protected generalError = signal('');
  
  protected readonly acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif';
  protected readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  protected uploadForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    summary: ['', [Validators.required, Validators.maxLength(500)]],
    tagsInput: [''],
    privacyLevel: ['private', [Validators.required]]
  });
  
  protected parsedTags = signal<string[]>([]);

  ngOnInit(): void {
    // Watch for changes in tags input
    this.uploadForm.get('tagsInput')?.valueChanges.subscribe(value => {
      if (value) {
        const tags = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
        this.parsedTags.set(tags);
      } else {
        this.parsedTags.set([]);
      }
    });
  }
  
  protected canSubmit = (): boolean => {
    return !!(this.selectedFile() && this.uploadForm.valid && !this.isUploading());
  };

  protected onFileSelect(event: any): void {
    const files = event.addedFiles;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.fileError.set('File size exceeds 10MB limit');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.fileError.set('File type not supported');
        return;
      }
      
      this.selectedFile.set(file);
      this.fileError.set('');
      
      // Auto-fill title if empty
      if (!this.uploadForm.get('title')?.value) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        this.uploadForm.patchValue({ title: fileName });
      }
    }
  }

  protected onFileRemove(): void {
    this.selectedFile.set(null);
    this.fileError.set('');
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    this.isUploading.set(true);
    this.generalError.set('');

    const file = this.selectedFile()!;
    const formValue = this.uploadForm.value;
    
    const metadata: DocumentMetadata = {
      title: formValue.title,
      summary: formValue.summary,
      tags: this.parsedTags(),
      privacyLevel: formValue.privacyLevel
    };

    this.documentService.uploadDocument(file, metadata).subscribe({
      next: (document) => {
        this.isUploading.set(false);
        this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/documents', document.id]);
      },
      error: (error) => {
        this.isUploading.set(false);
        const message = error.error?.message || 'Upload failed. Please try again.';
        this.generalError.set(message);
      }
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  protected getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'description';
    if (fileType.includes('image')) return 'image';
    return 'insert_drive_file';
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}