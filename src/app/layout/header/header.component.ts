import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <div class="confluence-header">
      <div class="header-container">
        <!-- Left side -->
        <div class="header-left">
          <button mat-icon-button (click)="menuToggle.emit()" class="menu-button desktop-only">
            <mat-icon>menu</mat-icon>
          </button>
          
          <div class="logo-container" [routerLink]="['/dashboard']">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="#0052CC"/>
              </svg>
            </div>
            <span class="logo-text desktop-only">Confluence</span>
          </div>
          
          <!-- Breadcrumb navigation -->
          <div class="breadcrumb-container desktop-only">
            <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
            <span class="breadcrumb-item">Space</span>
            <mat-icon class="breadcrumb-separator">chevron_right</mat-icon>
            <span class="breadcrumb-current">Current Page</span>
          </div>
        </div>
        
        <!-- Center search -->
        <div class="search-container">
          <div class="search-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input 
              class="search-input"
              [formControl]="searchControl"
              placeholder="Search">
            <button mat-icon-button class="search-filter-button" matTooltip="Search filters">
              <mat-icon>tune</mat-icon>
            </button>
          </div>
        </div>
        
        <!-- Right side -->
        <div class="header-right">
          <!-- Quick actions -->
          <button mat-icon-button class="header-action" matTooltip="Create" [routerLink]="['/documents/upload']">
            <mat-icon>add_circle_outline</mat-icon>
          </button>
          
          <button mat-icon-button class="header-action" matTooltip="Notifications">
            <mat-icon>notifications_none</mat-icon>
          </button>
          
          <button mat-icon-button class="header-action" matTooltip="Help">
            <mat-icon>help_outline</mat-icon>
          </button>
          
          <!-- User avatar -->
          <button class="user-avatar-button" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">
              <span class="user-initials">{{ getUserInitials() }}</span>
            </div>
          </button>
          
          <mat-menu #userMenu="matMenu" xPosition="before" class="user-menu">
            @if (currentUser(); as user) {
              <div class="user-menu-header">
                <div class="user-avatar large">
                  <span class="user-initials">{{ getUserInitials() }}</span>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
              <mat-divider></mat-divider>
              
              <button mat-menu-item (click)="navigateToProfile()">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </button>
              
              <button mat-menu-item (click)="navigateToSettings()">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              
              <mat-divider></mat-divider>
              
              <button mat-menu-item (click)="logout()" class="logout-item">
                <mat-icon>logout</mat-icon>
                <span>Log out</span>
              </button>
            }
          </mat-menu>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confluence-header {
      background: white;
      border-bottom: 1px solid #E4E6EA;
      box-shadow: 0 1px 3px rgba(9, 30, 66, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 56px;
    }
    
    .header-container {
      display: flex;
      align-items: center;
      height: 100%;
      max-width: 100%;
      padding: 0 16px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    
    .menu-button {
      color: #42526E;
      margin-right: 8px;
      
      &:hover {
        background-color: #F4F5F7;
      }
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      text-decoration: none;
      color: #172B4D;
      padding: 4px 8px;
      border-radius: 3px;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: #F4F5F7;
      }
    }
    
    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo-text {
      font-size: 16px;
      font-weight: 600;
      color: #172B4D;
    }
    
    .breadcrumb-container {
      display: flex;
      align-items: center;
      margin-left: 16px;
      color: #6B778C;
      font-size: 14px;
    }
    
    .breadcrumb-separator {
      font-size: 16px;
      margin: 0 4px;
      color: #C1C7D0;
    }
    
    .breadcrumb-item {
      color: #6B778C;
    }
    
    .breadcrumb-current {
      color: #172B4D;
      font-weight: 500;
    }
    
    .search-container {
      flex: 1;
      max-width: 680px;
      margin: 0 24px;
      display: flex;
      justify-content: center;
    }
    
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 540px;
      background: #F4F5F7;
      border: 2px solid transparent;
      border-radius: 6px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #EBECF0;
      }
      
      &:focus-within {
        background: white;
        border-color: #0052CC;
        box-shadow: 0 0 0 1px #0052CC;
      }
    }
    
    .search-icon {
      color: #6B778C;
      margin-left: 12px;
      font-size: 20px;
    }
    
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 8px 12px;
      font-size: 14px;
      color: #172B4D;
      outline: none;
      
      &::placeholder {
        color: #6B778C;
      }
    }
    
    .search-filter-button {
      color: #6B778C;
      width: 32px;
      height: 32px;
      margin-right: 4px;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .header-action {
      color: #42526E;
      width: 40px;
      height: 40px;
      
      &:hover {
        background-color: #F4F5F7;
      }
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .user-avatar-button {
      background: none;
      border: none;
      cursor: pointer;
      margin-left: 8px;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0052CC 0%, #0747A6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
      
      &.large {
        width: 40px;
        height: 40px;
      }
    }
    
    .user-initials {
      color: white;
      font-size: 12px;
      font-weight: 600;
      
      .large & {
        font-size: 14px;
      }
    }
    
    ::ng-deep .user-menu {
      min-width: 280px;
      
      .mat-mdc-menu-content {
        padding: 0;
      }
    }
    
    .user-menu-header {
      padding: 16px;
      background: #F4F5F7;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .user-details {
      flex: 1;
    }
    
    .user-name {
      font-weight: 600;
      color: #172B4D;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .user-email {
      color: #6B778C;
      font-size: 12px;
    }
    
    .logout-item {
      color: #DE350B !important;
      
      mat-icon {
        color: #DE350B !important;
      }
    }
    
    @media (max-width: 1024px) {
      .breadcrumb-container {
        display: none;
      }
      
      .search-container {
        max-width: 400px;
      }
    }
    
    @media (max-width: 768px) {
      .header-container {
        padding: 0 12px;
        gap: 8px;
      }
      
      .search-container {
        display: none;
      }
      
      .header-left {
        gap: 4px;
        min-width: auto;
      }
      
      .header-right {
        gap: 4px;
      }
      
      .header-action {
        width: 36px;
        height: 36px;
        padding: 6px;
      }
      
      .header-action mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      
      .user-avatar {
        width: 28px;
        height: 28px;
      }
      
      .user-initials {
        font-size: 11px;
      }
    }
    
    @media (max-width: 480px) {
      .header-container {
        padding: 0 8px;
        gap: 4px;
      }
      
      .logo-text {
        display: none;
      }
      
      .menu-button {
        width: 32px;
        height: 32px;
        padding: 4px;
        margin-right: 4px;
      }
      
      .logo-container {
        padding: 2px 4px;
        gap: 4px;
      }
      
      .logo-icon svg {
        width: 20px;
        height: 20px;
      }
      
      .header-action {
        width: 32px;
        height: 32px;
        padding: 4px;
      }
      
      .header-action mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      
      .user-avatar {
        width: 24px;
        height: 24px;
      }
      
      .user-initials {
        font-size: 10px;
      }
      
      .header-right {
        gap: 2px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  protected menuToggle = output<void>();
  protected currentUser = this.authService.currentUser;
  protected searchControl = new FormControl('');
  
  protected logout(): void {
    this.authService.logout();
  }
  
  protected navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
  
  protected navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
  
  protected getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'U';
    
    const names = user.username.split('.');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }
}