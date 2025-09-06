import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'documents',
        children: [
          {
            path: 'my',
            loadComponent: () => import('./features/documents/my-documents.component').then(m => m.MyDocumentsComponent)
          },
          {
            path: 'browse',
            loadComponent: () => import('./features/documents/browse-documents.component').then(m => m.BrowseDocumentsComponent)
          },
          {
            path: 'upload',
            loadComponent: () => import('./features/documents/upload-document.component').then(m => m.UploadDocumentComponent)
          },
          {
            path: 'recent',
            loadComponent: () => import('./features/documents/recent-documents.component').then(m => m.RecentDocumentsComponent)
          },
          {
            path: 'starred',
            loadComponent: () => import('./features/documents/starred-documents.component').then(m => m.StarredDocumentsComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/documents/document-detail.component').then(m => m.DocumentDetailComponent)
          }
        ]
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
