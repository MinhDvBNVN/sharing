import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  description?: string;
  category?: 'main' | 'spaces' | 'recent';
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="confluence-sidebar">
      <div class="sidebar-content">
        
        <!-- Main Navigation -->
        <div class="nav-section">
          <div class="nav-list">
            @for (item of mainNavItems; track item.route) {
              <a class="nav-item" 
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 [matTooltip]="item.description || item.label"
                 matTooltipPosition="right">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          </div>
        </div>

        <mat-divider class="section-divider"></mat-divider>

        <!-- Spaces Section -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-title">Spaces</span>
            <button mat-icon-button class="section-action" matTooltip="Create space">
              <mat-icon>add</mat-icon>
            </button>
          </div>
          
          <div class="nav-list">
            @for (space of spaceItems; track space.route) {
              <a class="nav-item space-item" 
                 [routerLink]="space.route"
                 routerLinkActive="active">
                <div class="space-avatar">
                  <span class="space-initial">{{ getSpaceInitial(space.label) }}</span>
                </div>
                <span class="nav-label">{{ space.label }}</span>
              </a>
            }
            
            <button class="nav-item action-item" (click)="viewAllSpaces()">
              <mat-icon class="nav-icon">folder_open</mat-icon>
              <span class="nav-label">View all spaces</span>
            </button>
          </div>
        </div>

        <mat-divider class="section-divider"></mat-divider>

        <!-- Recent Section -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-title">Recent</span>
          </div>
          
          <div class="nav-list">
            @for (item of recentItems; track item.route) {
              <a class="nav-item recent-item" 
                 [routerLink]="item.route"
                 routerLinkActive="active">
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
            
            @if (recentItems.length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">history</mat-icon>
                <p class="empty-text">Your recently viewed pages will appear here</p>
              </div>
            }
          </div>
        </div>

        <mat-divider class="section-divider"></mat-divider>

        <!-- Apps Section -->
        <div class="nav-section">
          <div class="section-header">
            <span class="section-title">Apps</span>
          </div>
          
          <div class="nav-list">
            @for (app of appItems; track app.route) {
              <a class="nav-item app-item" 
                 [routerLink]="app.route"
                 routerLinkActive="active">
                <mat-icon class="nav-icon">{{ app.icon }}</mat-icon>
                <span class="nav-label">{{ app.label }}</span>
              </a>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .confluence-sidebar {
      width: 100%;
      height: 100%;
      background: #F4F5F7;
      border-right: 1px solid #E4E6EA;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .sidebar-content {
      padding: 16px 0;
    }
    
    .nav-section {
      margin-bottom: 8px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px 4px 16px;
      margin-bottom: 4px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: #6B778C;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-action {
      width: 24px;
      height: 24px;
      color: #6B778C;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        background-color: #E4E6EA;
        color: #42526E;
      }
    }
    
    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      text-decoration: none;
      color: #42526E;
      transition: all 0.2s ease;
      border-radius: 0;
      position: relative;
      min-height: 40px;
      
      &:hover {
        background-color: #E4E6EA;
        color: #172B4D;
      }
      
      &.active {
        background-color: #DEEBFF;
        color: #0052CC;
        border-right: 2px solid #0052CC;
        
        .nav-icon {
          color: #0052CC;
        }
      }
    }
    
    .action-item {
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      width: 100%;
      
      &:hover {
        background-color: #E4E6EA;
      }
    }
    
    .nav-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      margin-right: 12px;
      color: #6B778C;
      flex-shrink: 0;
    }
    
    .nav-label {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.4;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .space-item {
      .nav-icon {
        margin-right: 8px;
      }
    }
    
    .space-avatar {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .space-initial {
      color: white;
      font-size: 10px;
      font-weight: 600;
    }
    
    .recent-item {
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
      }
    }
    
    .section-divider {
      margin: 16px;
      border-color: #E4E6EA;
    }
    
    .empty-state {
      padding: 16px;
      text-align: center;
      color: #6B778C;
    }
    
    .empty-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      opacity: 0.5;
      margin-bottom: 8px;
    }
    
    .empty-text {
      font-size: 12px;
      margin: 0;
      line-height: 1.4;
    }
    
    .app-item {
      .nav-icon {
        color: #FF8B00;
      }
      
      &:hover .nav-icon {
        color: #FF8B00;
      }
    }
    
    /* Custom scrollbar */
    .confluence-sidebar::-webkit-scrollbar {
      width: 6px;
    }
    
    .confluence-sidebar::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .confluence-sidebar::-webkit-scrollbar-thumb {
      background: #C1C7D0;
      border-radius: 3px;
    }
    
    .confluence-sidebar::-webkit-scrollbar-thumb:hover {
      background: #97A0AF;
    }
    
    @media (max-width: 1024px) {
      .sidebar-content {
        padding: 12px 0;
      }
      
      .nav-item {
        padding: 6px 12px;
        min-height: 36px;
      }
      
      .section-header {
        padding: 6px 12px 2px 12px;
      }
    }
    
    @media (max-width: 768px) {
      .confluence-sidebar {
        background: white;
        border-right: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .sidebar-content {
        padding: 16px 0;
      }
      
      .nav-item {
        padding: 12px 16px;
        min-height: 48px;
      }
      
      .section-header {
        padding: 12px 16px 8px 16px;
      }
      
      .nav-icon {
        width: 24px;
        height: 24px;
        font-size: 24px;
        margin-right: 16px;
      }
      
      .nav-label {
        font-size: 16px;
      }
      
      .section-title {
        font-size: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .nav-item {
        padding: 10px 12px;
        min-height: 44px;
      }
      
      .section-header {
        padding: 10px 12px 6px 12px;
      }
      
      .nav-icon {
        width: 22px;
        height: 22px;
        font-size: 22px;
        margin-right: 12px;
      }
      
      .space-avatar {
        width: 22px;
        height: 22px;
        margin-right: 12px;
      }
      
      .nav-label {
        font-size: 15px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class SidebarComponent {
  private router = inject(Router);
  
  protected mainNavItems: NavigationItem[] = [
    {
      label: 'Home',
      icon: 'home',
      route: '/dashboard',
      description: 'Go to your dashboard'
    },
    {
      label: 'Recent',
      icon: 'access_time',
      route: '/documents/recent',
      description: 'Recently viewed pages'
    },
    {
      label: 'Starred',
      icon: 'star_border',
      route: '/documents/starred',
      description: 'Your starred pages'
    },
    {
      label: 'All content',
      icon: 'folder_open',
      route: '/documents/browse',
      description: 'Browse all content'
    },
    {
      label: 'Search',
      icon: 'search',
      route: '/search',
      description: 'Search for content'
    }
  ];

  protected spaceItems: NavigationItem[] = [
    {
      label: 'Engineering',
      icon: '',
      route: '/spaces/engineering'
    },
    {
      label: 'Product',
      icon: '',
      route: '/spaces/product'
    },
    {
      label: 'Design',
      icon: '',
      route: '/spaces/design'
    },
    {
      label: 'Marketing',
      icon: '',
      route: '/spaces/marketing'
    }
  ];

  protected recentItems: NavigationItem[] = [
    // This would be populated with actual recent items from a service
  ];

  protected appItems: NavigationItem[] = [
    {
      label: 'Jira',
      icon: 'bug_report',
      route: '/apps/jira'
    },
    {
      label: 'Trello',
      icon: 'view_kanban',
      route: '/apps/trello'
    },
    {
      label: 'Slack',
      icon: 'chat_bubble_outline',
      route: '/apps/slack'
    }
  ];
  
  protected viewAllSpaces(): void {
    this.router.navigate(['/spaces']);
  }
  
  protected getSpaceInitial(spaceName: string): string {
    return spaceName.charAt(0).toUpperCase();
  }
}