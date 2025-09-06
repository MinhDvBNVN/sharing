import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-browse-documents',
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon>folder_open</mat-icon>
          </div>
          <mat-card-title>Browse All Documents</mat-card-title>
          <mat-card-subtitle>All accessible documents in your organization</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>This component will show all browsable documents.</p>
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
export class BrowseDocumentsComponent {}