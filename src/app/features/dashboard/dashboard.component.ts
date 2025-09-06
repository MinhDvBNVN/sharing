import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';

import { DocumentService, Document } from '../../core/services/document.service';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { DocumentCardComponent } from '../../shared/components/document-card.component';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="confluence-dashboard">
      <!-- Hero Section -->
      <div class="dashboard-hero">
        <div class="welcome-content">
          <h1 class="welcome-title">
            Good {{ getTimeOfDay() }}, {{ getDisplayName() }}!
          </h1>
          <p class="welcome-subtitle">
            Here's what's happening in your spaces
          </p>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button mat-raised-button color="primary" [routerLink]="['/documents/upload']" class="action-button">
            <mat-icon>create</mat-icon>
            Create
          </button>
          <button mat-stroked-button [routerLink]="['/search']" class="action-button">
            <mat-icon>search</mat-icon>
            Search
          </button>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="content-sections">
        <!-- Recent Documents -->
        <div class="content-section recent-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <mat-icon class="section-icon">schedule</mat-icon>
              <h2 class="section-title">Recent</h2>
            </div>
            <button mat-button [routerLink]="['/documents/recent']" class="view-all-button">
              View all
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          @if (loadingRecent()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (recentDocuments().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">article</mat-icon>
              <p>No recent documents found</p>
              <button mat-raised-button color="primary" [routerLink]="['/documents/browse']">
                Browse Documents
              </button>
            </div>
          } @else {
            <div class="documents-grid">
              @for (doc of recentDocuments(); track doc.id) {
                <app-document-card
                  [document]="doc"
                  [currentUserId]="currentUser()?.id"
                  [compact]="true"
                  (view)="onViewDocument($event)"
                  (edit)="onEditDocument($event)"
                  (download)="onDownloadDocument($event)"
                  (star)="onStarDocument($event)">
                </app-document-card>
              }
            </div>
          }
        </div>

        <!-- Popular Documents -->
        <div class="content-section popular-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <mat-icon class="section-icon">trending_up</mat-icon>
              <h2 class="section-title">Popular</h2>
            </div>
            <button mat-button [routerLink]="['/documents/browse']" class="view-all-button">
              View all
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          @if (loadingPopular()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (popularDocuments().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">trending_up</mat-icon>
              <p>No popular documents found</p>
            </div>
          } @else {
            <div class="documents-grid">
              @for (doc of popularDocuments(); track doc.id) {
                <app-document-card
                  [document]="doc"
                  [currentUserId]="currentUser()?.id"
                  (view)="onViewDocument($event)"
                  (edit)="onEditDocument($event)"
                  (download)="onDownloadDocument($event)"
                  (star)="onStarDocument($event)">
                </app-document-card>
              }
            </div>
          }
        </div>

        <!-- My Documents -->
        <div class="content-section my-docs-section">
          <div class="section-header">
            <div class="section-title-wrapper">
              <mat-icon class="section-icon">account_circle</mat-icon>
              <h2 class="section-title">My content</h2>
            </div>
            <button mat-button [routerLink]="['/documents/my']" class="view-all-button">
              View all
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>

          @if (loadingMyDocs()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (myDocuments().length === 0) {
            <div class="empty-state">
              <mat-icon class="empty-icon">note_add</mat-icon>
              <p>You haven't uploaded any documents yet</p>
              <button mat-raised-button color="primary" [routerLink]="['/documents/upload']">
                Upload Document
              </button>
            </div>
          } @else {
            <div class="documents-grid">
              @for (doc of myDocuments(); track doc.id) {
                <app-document-card
                  [document]="doc"
                  [currentUserId]="currentUser()?.id"
                  (view)="onViewDocument($event)"
                  (edit)="onEditDocument($event)"
                  (download)="onDownloadDocument($event)"
                  (star)="onStarDocument($event)">
                </app-document-card>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confluence-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .dashboard-hero {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
      padding: 32px 0;
      border-bottom: 1px solid #E4E6EA;
    }

    .welcome-content {
      flex: 1;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 500;
      color: #172B4D;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: #6B778C;
      margin: 0;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      height: 40px;
    }

    .content-sections {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .content-section {
      width: 100%;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #E4E6EA;
    }

    .section-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      color: #6B778C;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 500;
      color: #172B4D;
      margin: 0;
    }

    .view-all-button {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #0052CC;
    }

    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .hero-section {
      margin-bottom: 48px;
      text-align: center;
    }

    .welcome-content {
      margin-bottom: 32px;
    }

    .welcome-title {
      font-size: 32px;
      font-weight: 500;
      color: #172b4d;
      margin: 0 0 8px 0;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: #6b778c;
      margin: 0;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    .stat-card {
      background: linear-gradient(135deg, #0052cc 0%, #0065ff 100%);
      color: white;
    }

    .stat-card mat-card-content {
      padding: 24px !important;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      opacity: 0.8;
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content-grid {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .content-section {
      width: 100%;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e6ea;
    }

    .section-title {
      font-size: 20px;
      font-weight: 500;
      color: #172b4d;
      margin: 0;
    }

    .section-header button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      padding: 8px 0;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 48px 0;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #6b778c;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    @media (max-width: 1024px) {
      .confluence-dashboard {
        padding: 0 12px;
      }
      
      .dashboard-hero {
        margin-bottom: 32px;
        padding: 24px 0;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
      }
      
      .quick-actions {
        width: 100%;
        justify-content: flex-start;
      }
      
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .confluence-dashboard {
        padding: 0 8px;
      }
      
      .dashboard-hero {
        margin-bottom: 24px;
        padding: 16px 0;
        text-align: left;
      }
      
      .welcome-title {
        font-size: 24px;
        line-height: 1.3;
      }
      
      .welcome-subtitle {
        font-size: 14px;
      }
      
      .quick-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        width: 100%;
      }
      
      .action-button {
        justify-content: center;
        min-width: 100%;
        height: 44px;
      }
      
      .content-sections {
        gap: 32px;
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 4px 0;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .section-title-wrapper {
        gap: 8px;
      }
      
      .section-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      
      .section-title {
        font-size: 18px;
      }
      
      .view-all-button {
        font-size: 14px;
        padding: 4px 8px;
      }
    }
    
    @media (max-width: 480px) {
      .confluence-dashboard {
        padding: 0 4px;
      }
      
      .dashboard-hero {
        padding: 12px 0;
        margin-bottom: 20px;
      }
      
      .welcome-title {
        font-size: 20px;
      }
      
      .welcome-subtitle {
        font-size: 13px;
      }
      
      .action-button {
        height: 40px;
        font-size: 14px;
      }
      
      .content-sections {
        gap: 24px;
      }
      
      .section-header {
        margin-bottom: 12px;
        padding-bottom: 8px;
      }
      
      .section-title {
        font-size: 16px;
      }
      
      .documents-grid {
        gap: 12px;
      }
      
      .empty-state {
        padding: 32px 16px;
      }
      
      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      
      .empty-state p {
        font-size: 14px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    RouterModule,
    DocumentCardComponent
  ]
})
export class DashboardComponent implements OnInit {
  private documentService = inject(DocumentService);
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private router = inject(Router);

  protected currentUser = this.authService.currentUser;

  protected recentDocuments = signal<Document[]>([]);
  protected popularDocuments = signal<Document[]>([]);
  protected myDocuments = signal<Document[]>([]);

  protected loadingRecent = signal(false);
  protected loadingPopular = signal(false);
  protected loadingMyDocs = signal(false);

  protected totalDocuments = computed(() => {
    const recent = this.recentDocuments().length;
    const popular = this.popularDocuments().length;
    const my = this.myDocuments().length;
    return Math.max(recent, popular, my);
  });

  protected totalViews = computed(() => {
    return this.recentDocuments().reduce((sum, doc) => sum + doc.viewCount, 0);
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load recent documents using mock data
    this.loadingRecent.set(true);
    this.mockDataService.getRecentDocuments(5).subscribe({
      next: (docs) => {
        this.recentDocuments.set(docs);
        this.loadingRecent.set(false);
      },
      error: (error) => {
        console.error('Error loading recent documents:', error);
        this.loadingRecent.set(false);
      }
    });

    // Load popular documents using mock data
    this.loadingPopular.set(true);
    this.mockDataService.getPopularDocuments(5).subscribe({
      next: (docs) => {
        this.popularDocuments.set(docs);
        this.loadingPopular.set(false);
      },
      error: (error) => {
        console.error('Error loading popular documents:', error);
        this.loadingPopular.set(false);
      }
    });

    // Load user's documents using mock data
    this.loadingMyDocs.set(true);
    const currentUser = this.currentUser();
    if (currentUser) {
      this.mockDataService.getMyDocuments(currentUser.id, 5).subscribe({
        next: (docs) => {
          this.myDocuments.set(docs);
          this.loadingMyDocs.set(false);
        },
        error: (error) => {
          console.error('Error loading my documents:', error);
          this.loadingMyDocs.set(false);
        }
      });
    } else {
      this.loadingMyDocs.set(false);
    }
  }

  protected onViewDocument(document: Document): void {
    this.router.navigate(['/documents', document.id]);
  }

  protected onEditDocument(document: Document): void {
    this.router.navigate(['/documents/edit', document.id]);
  }

  protected onDownloadDocument(document: Document): void {
    window.open(document.fileUrl, '_blank');
  }

  protected onStarDocument(document: Document): void {
    // Mock implementation - would toggle star in real app
    console.log('Star toggled for document:', document.title);
  }

  protected getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  protected getDisplayName(): string {
    const user = this.currentUser();
    if (!user) return 'there';

    const names = user.username.split('.');
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[0].slice(1);
    }
    return user.username;
  }
}
