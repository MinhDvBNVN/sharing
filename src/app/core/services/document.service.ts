import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';

export interface Document {
  id: string;
  title: string;
  summary: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  ownerId: string;
  ownerName: string;
  privacyLevel: 'private' | 'group' | 'public';
  tags: Tag[];
  rating: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface DocumentMetadata {
  title: string;
  summary: string;
  tags: string[];
  privacyLevel: 'private' | 'group' | 'public';
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  privacyLevel?: ('private' | 'group' | 'public')[];
  fileType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  author?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'alphabetical';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  
  private documentsCache = signal<Document[]>([]);
  private isLoading = signal(false);
  
  public readonly documents = this.documentsCache.asReadonly();
  public readonly loading = this.isLoading.asReadonly();

  uploadDocument(file: File, metadata: DocumentMetadata): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    return this.http.post<Document>('/api/documents/upload', formData).pipe(
      tap(document => {
        const currentDocs = this.documentsCache();
        this.documentsCache.set([document, ...currentDocs]);
      })
    );
  }

  getDocuments(filters?: SearchFilters, page = 1, pageSize = 20): Observable<PaginatedResponse<Document>> {
    this.isLoading.set(true);
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters) {
      if (filters.query) params = params.set('query', filters.query);
      if (filters.tags?.length) params = params.set('tags', filters.tags.join(','));
      if (filters.privacyLevel?.length) params = params.set('privacyLevel', filters.privacyLevel.join(','));
      if (filters.fileType?.length) params = params.set('fileType', filters.fileType.join(','));
      if (filters.author) params = params.set('author', filters.author);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
      if (filters.dateRange) {
        params = params.set('startDate', filters.dateRange.start.toISOString());
        params = params.set('endDate', filters.dateRange.end.toISOString());
      }
    }
    
    return this.http.get<PaginatedResponse<Document>>('/api/documents', { params }).pipe(
      tap(response => {
        if (page === 1) {
          this.documentsCache.set(response.data);
        } else {
          const currentDocs = this.documentsCache();
          this.documentsCache.set([...currentDocs, ...response.data]);
        }
        this.isLoading.set(false);
      })
    );
  }

  getDocumentById(id: string): Observable<Document> {
    return this.http.get<Document>(`/api/documents/${id}`);
  }

  updateDocument(id: string, updates: Partial<Document>): Observable<Document> {
    return this.http.patch<Document>(`/api/documents/${id}`, updates).pipe(
      tap(updatedDoc => {
        const currentDocs = this.documentsCache();
        const index = currentDocs.findIndex(doc => doc.id === id);
        if (index >= 0) {
          const newDocs = [...currentDocs];
          newDocs[index] = updatedDoc;
          this.documentsCache.set(newDocs);
        }
      })
    );
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`/api/documents/${id}`).pipe(
      tap(() => {
        const currentDocs = this.documentsCache();
        this.documentsCache.set(currentDocs.filter(doc => doc.id !== id));
      })
    );
  }

  rateDocument(documentId: string, rating: number): Observable<Document> {
    return this.http.post<Document>(`/api/documents/${documentId}/rate`, { rating }).pipe(
      tap(updatedDoc => {
        const currentDocs = this.documentsCache();
        const index = currentDocs.findIndex(doc => doc.id === documentId);
        if (index >= 0) {
          const newDocs = [...currentDocs];
          newDocs[index] = updatedDoc;
          this.documentsCache.set(newDocs);
        }
      })
    );
  }

  getRecentDocuments(limit = 5): Observable<Document[]> {
    return this.http.get<Document[]>(`/api/documents/recent?limit=${limit}`);
  }

  getPopularDocuments(limit = 5): Observable<Document[]> {
    return this.http.get<Document[]>(`/api/documents/popular?limit=${limit}`);
  }

  getMyDocuments(limit?: number): Observable<Document[]> {
    const params = limit ? new HttpParams().set('limit', limit.toString()) : undefined;
    return this.http.get<Document[]>('/api/documents/my', { params });
  }

  getStarredDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>('/api/documents/starred');
  }

  toggleStarDocument(documentId: string): Observable<{ starred: boolean }> {
    return this.http.post<{ starred: boolean }>(`/api/documents/${documentId}/star`, {});
  }
}