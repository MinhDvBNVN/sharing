import { Component, inject, ChangeDetectionStrategy, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-container">
      <app-header (menuToggle)="toggleSidebar()"></app-header>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          #drawer 
          class="sidenav"
          fixedInViewport
          [attr.role]="'navigation'"
          [mode]="sidenavMode()"
          [opened]="sidenavOpened()"
          (openedChange)="onSidenavOpenedChange($event)">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #F4F5F7;
    }
    
    .sidenav-container {
      flex: 1;
      height: calc(100vh - 56px);
    }
    
    .sidenav {
      width: 280px;
      border: none;
      background-color: transparent;
    }
    
    .main-content {
      background-color: #F4F5F7;
    }
    
    .content-wrapper {
      padding: 24px;
      max-width: 1440px;
      margin: 0 auto;
      min-height: calc(100vh - 56px - 48px);
    }
    
    @media (max-width: 1200px) {
      .content-wrapper {
        max-width: 100%;
        padding: 16px;
      }
    }
    
    @media (max-width: 1024px) {
      .sidenav {
        width: 260px;
      }
    }
    
    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      .content-wrapper {
        padding: 12px;
        min-height: calc(100vh - 56px - 24px);
      }
      
      .main-content {
        margin-left: 0 !important;
      }
    }
    
    @media (max-width: 480px) {
      .sidenav {
        width: 100%;
        max-width: 320px;
      }
      
      .content-wrapper {
        padding: 8px;
        min-height: calc(100vh - 56px - 16px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    HeaderComponent,
    SidebarComponent
  ]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  
  @ViewChild('drawer') drawer!: MatSidenav;
  
  protected currentUser = this.authService.currentUser;
  
  private isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);
  private sidenavOpenedSignal = signal(!this.isHandset);
  
  protected sidenavMode = computed(() => {
    return this.breakpointObserver.isMatched(Breakpoints.Handset) ? 'over' : 'side';
  });
  
  protected sidenavOpened = computed(() => {
    return this.breakpointObserver.isMatched(Breakpoints.Handset) ? false : this.sidenavOpenedSignal();
  });
  
  protected toggleSidebar(): void {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }
  
  protected onSidenavOpenedChange(opened: boolean): void {
    this.sidenavOpenedSignal.set(opened);
  }
}