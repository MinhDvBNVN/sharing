import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Document } from '../../core/services/document.service';

@Component({
  selector: 'app-document-card',
  template: `
    <mat-card class="document-card" [class.compact]="compact()">
      <div class="card-header">
        <div class="file-icon">
          <mat-icon [class]="fileIconClass()">{{ fileIcon() }}</mat-icon>
        </div>
        
        @if (!compact()) {
          <button mat-icon-button [matMenuTriggerFor]="cardMenu" class="card-menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #cardMenu="matMenu">
            <button mat-menu-item (click)="onView()">
              <mat-icon>visibility</mat-icon>
              <span>View</span>
            </button>
            
            @if (canEdit()) {
              <button mat-menu-item (click)="onEdit()">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
            }
            
            <button mat-menu-item (click)="onDownload()">
              <mat-icon>download</mat-icon>
              <span>Download</span>
            </button>
            
            <button mat-menu-item (click)="onStar()">
              <mat-icon>{{ starred() ? 'star' : 'star_border' }}</mat-icon>
              <span>{{ starred() ? 'Unstar' : 'Star' }}</span>
            </button>
          </mat-menu>
        }
      </div>
      
      <mat-card-content class="card-content">
        <div class="document-info">
          <h3 class="document-title" 
              [matTooltip]="document().title"
              [routerLink]="['/documents', document().id]">
            {{ document().title }}
          </h3>
          
          <p class="document-summary" [class.compact]="compact()">
            {{ truncatedSummary() }}
          </p>
          
          @if (document().tags.length > 0 && !compact()) {
            <div class="tags-container">
              @for (tag of displayTags(); track tag.id) {
                <mat-chip class="document-tag" [style.background-color]="tag.color">
                  {{ tag.name }}
                </mat-chip>
              }
              @if (document().tags.length > maxTags()) {
                <mat-chip class="more-tags">
                  +{{ document().tags.length - maxTags() }}
                </mat-chip>
              }
            </div>
          }
        </div>
      </mat-card-content>
      
      <mat-card-actions class="card-actions">
        <div class="author-info">
          <mat-icon class="author-icon">person</mat-icon>
          <span class="author-name">{{ document().ownerName }}</span>
        </div>
        
        <div class="document-meta">
          <div class="rating" [matTooltip]="'Average rating: ' + document().rating + '/5'">
            <mat-icon class="rating-icon">star</mat-icon>
            <span class="rating-text">{{ formatRating(document().rating) }}</span>
          </div>
          
          <div class="views" [matTooltip]="document().viewCount + ' views'">
            <mat-icon class="views-icon">visibility</mat-icon>
            <span class="views-text">{{ formatCount(document().viewCount) }}</span>
          </div>
          
          <div class="date" [matTooltip]="formatFullDate(document().createdAt)">
            {{ formatRelativeDate(document().createdAt) }}
          </div>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .document-card {
      cursor: default;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(9, 30, 66, 0.25), 0 0 0 1px rgba(9, 30, 66, 0.08);
      will-change: transform, box-shadow;
      z-index: 1;
      isolation: isolate;
    }
    
    .document-card:hover {
      box-shadow: 0 8px 25px rgba(9, 30, 66, 0.15), 0 0 0 1px rgba(9, 30, 66, 0.08);
      transform: translateY(-4px);
      z-index: 10;
    }
    
    .document-card.compact {
      margin-bottom: 8px;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 16px 0 16px;
      position: relative;
      z-index: 2;
    }
    
    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background-color: #f4f5f7;
    }
    
    .file-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .file-icon .pdf { color: #de350b; }
    .file-icon .doc { color: #0052cc; }
    .file-icon .image { color: #36b37e; }
    .file-icon .default { color: #6b778c; }
    
    .card-menu {
      position: absolute;
      top: 8px;
      right: 8px;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 20;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .document-card:hover .card-menu {
      opacity: 1;
      background-color: rgba(255, 255, 255, 1);
    }
    
    .card-content {
      padding: 16px !important;
      position: relative;
      z-index: 2;
      background-color: white;
    }
    
    .compact .card-content {
      padding: 8px 16px !important;
    }
    
    .document-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #172b4d;
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
      transition: color 0.2s ease;
      cursor: pointer;
    }
    
    .document-title:hover {
      color: #0052cc;
      text-decoration: underline;
    }
    
    .document-summary {
      color: #6b778c;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .document-summary.compact {
      -webkit-line-clamp: 1;
      margin: 0;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
    
    .document-tag {
      font-size: 11px;
      min-height: 20px;
      line-height: 20px;
      color: white;
      border: none;
    }
    
    .more-tags {
      background-color: #e4e6ea;
      color: #6b778c;
      font-size: 11px;
    }
    
    .card-actions {
      padding: 8px 16px 16px 16px !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 2;
      background-color: white;
    }
    
    .author-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #6b778c;
      font-size: 12px;
    }
    
    .author-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .document-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #6b778c;
    }
    
    .rating, .views {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    .rating-icon, .views-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .rating-icon {
      color: #ffab00;
    }
    
    /* Prevent hover conflicts with Material components */
    ::ng-deep .document-card .mat-mdc-card {
      background-color: white !important;
      box-shadow: none !important;
      position: relative !important;
      z-index: 1 !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }
    
    ::ng-deep .document-card .mat-mdc-card-content {
      pointer-events: auto;
      position: relative !important;
      z-index: 2 !important;
    }
    
    ::ng-deep .document-card .mat-mdc-card-actions {
      position: relative !important;
      z-index: 2 !important;
    }
    
    @media (max-width: 1024px) {
      .document-card {
        margin-bottom: 12px;
      }
      
      .card-header {
        padding: 12px 12px 0 12px;
      }
      
      .card-content {
        padding: 12px !important;
      }
      
      .card-actions {
        padding: 6px 12px 12px 12px !important;
      }
      
      .document-title {
        font-size: 15px;
      }
      
      .document-summary {
        font-size: 13px;
      }
    }
    
    @media (max-width: 768px) {
      .document-card {
        margin-bottom: 10px;
      }
      
      .document-card:hover {
        transform: translateY(-2px);
      }
      
      .card-header {
        padding: 16px 16px 0 16px;
      }
      
      .card-content {
        padding: 14px !important;
      }
      
      .compact .card-content {
        padding: 10px 14px !important;
      }
      
      .card-actions {
        padding: 8px 16px 16px 16px !important;
      }
      
      .document-title {
        font-size: 16px;
        margin-bottom: 6px;
      }
      
      .document-summary {
        font-size: 14px;
        margin-bottom: 10px;
        -webkit-line-clamp: 2;
      }
      
      .document-summary.compact {
        margin-bottom: 0;
      }
      
      .document-meta {
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }
      
      .rating, .views {
        gap: 3px;
      }
      
      .author-info {
        gap: 6px;
        font-size: 13px;
      }
      
      .document-meta {
        font-size: 13px;
      }
      
      .tags-container {
        margin-top: 6px;
        gap: 3px;
      }
      
      .document-tag {
        font-size: 10px;
        min-height: 18px;
        line-height: 18px;
      }
    }
    
    @media (max-width: 480px) {
      .document-card {
        margin-bottom: 8px;
      }
      
      .card-header {
        padding: 12px 12px 0 12px;
      }
      
      .card-content {
        padding: 12px !important;
      }
      
      .compact .card-content {
        padding: 8px 12px !important;
      }
      
      .card-actions {
        padding: 6px 12px 12px 12px !important;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .file-icon {
        width: 40px;
        height: 40px;
      }
      
      .file-icon mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      
      .document-title {
        font-size: 15px;
        -webkit-line-clamp: 1;
      }
      
      .document-summary {
        font-size: 13px;
        -webkit-line-clamp: 1;
        margin-bottom: 8px;
      }
      
      .author-info {
        font-size: 12px;
        order: 2;
      }
      
      .document-meta {
        order: 1;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        font-size: 12px;
      }
      
      .tags-container {
        display: none;
      }
      
      .card-menu {
        top: 6px;
        right: 6px;
        width: 28px;
        height: 28px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class DocumentCardComponent {
  document = input.required<Document>();
  compact = input(false);
  currentUserId = input<string>();
  starred = input(false);
  maxTags = input(3);
  
  view = output<Document>();
  edit = output<Document>();
  download = output<Document>();
  star = output<Document>();
  
  protected canEdit = computed(() => {
    const doc = this.document();
    const userId = this.currentUserId();
    return userId && doc.ownerId === userId;
  });
  
  protected fileIcon = computed(() => {
    const fileType = this.document().fileType.toLowerCase();
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'description';
    if (fileType.includes('image')) return 'image';
    return 'insert_drive_file';
  });
  
  protected fileIconClass = computed(() => {
    const fileType = this.document().fileType.toLowerCase();
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'doc';
    if (fileType.includes('image')) return 'image';
    return 'default';
  });
  
  protected truncatedSummary = computed(() => {
    const summary = this.document().summary;
    const maxLength = this.compact() ? 100 : 200;
    return summary.length > maxLength ? summary.substring(0, maxLength) + '...' : summary;
  });
  
  protected displayTags = computed(() => {
    return this.document().tags.slice(0, this.maxTags());
  });
  
  protected onView(): void {
    this.view.emit(this.document());
  }
  
  protected onEdit(): void {
    this.edit.emit(this.document());
  }
  
  protected onDownload(): void {
    this.download.emit(this.document());
  }
  
  protected onStar(): void {
    this.star.emit(this.document());
  }
  
  protected formatRating(rating: number): string {
    return rating.toFixed(1);
  }
  
  protected formatCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'k';
    return (count / 1000000).toFixed(1) + 'm';
  }
  
  protected formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
  
  protected formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}