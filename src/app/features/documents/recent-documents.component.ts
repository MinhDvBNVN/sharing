import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recent-documents',
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>history</mat-icon>
          </div>
          <mat-card-title>Recently Viewed</mat-card-title>
          <mat-card-subtitle>Documents you have viewed recently</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>This component will show recently viewed documents.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatIconModule]
})
export class RecentDocumentsComponent {}