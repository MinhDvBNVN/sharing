import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-starred-documents',
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>star</mat-icon>
          </div>
          <mat-card-title>Starred Documents</mat-card-title>
          <mat-card-subtitle>Your bookmarked documents</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>This component will show starred/bookmarked documents.</p>
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
export class StarredDocumentsComponent {}