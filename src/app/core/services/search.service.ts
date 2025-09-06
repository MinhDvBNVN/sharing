import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { Document, SearchFilters, PaginatedResponse } from './document.service';

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'tag' | 'author';
  count?: number;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  resultCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);
  
  private searchHistorySignal = signal<SearchHistory[]>([]);
  private isSearching = signal(false);
  
  public readonly searchHistory = this.searchHistorySignal.asReadonly();
  public readonly searching = this.isSearching.asReadonly();

  searchDocuments(query: string, filters?: SearchFilters, page = 1, pageSize = 20): Observable<PaginatedResponse<Document>> {
    this.isSearching.set(true);
    
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters) {
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
    
    return this.http.get<PaginatedResponse<Document>>('/api/search', { params }).pipe(
      tap(response => {
        this.isSearching.set(false);
        if (page === 1) {
          this.saveRecentSearch(query, response.total);
        }
      })
    );
  }

  getSuggestions(query: string): Observable<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return new Observable(observer => observer.next([]));
    }
    
    const params = new HttpParams().set('q', query);
    return this.http.get<SearchSuggestion[]>('/api/search/suggestions', { params });
  }

  getPopularTags(limit = 20): Observable<{ name: string; count: number; color: string }[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ name: string; count: number; color: string }[]>('/api/search/tags', { params });
  }

  getRecentSearches(limit = 10): Observable<SearchHistory[]> {
    return new Observable(observer => {
      const recent = this.searchHistorySignal().slice(0, limit);
      observer.next(recent);
      observer.complete();
    });
  }

  saveRecentSearch(query: string, resultCount: number): void {
    const currentHistory = this.searchHistorySignal();
    
    // Remove duplicate if exists
    const filteredHistory = currentHistory.filter(item => item.query !== query);
    
    // Add new search to beginning
    const newHistory: SearchHistory = {
      query,
      timestamp: new Date(),
      resultCount
    };
    
    // Keep only last 20 searches
    const updatedHistory = [newHistory, ...filteredHistory].slice(0, 20);
    this.searchHistorySignal.set(updatedHistory);
    
    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.warn('Unable to save search history to localStorage:', error);
      }
    }
  }

  clearSearchHistory(): void {
    this.searchHistorySignal.set([]);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('searchHistory');
      } catch (error) {
        console.warn('Unable to clear search history from localStorage:', error);
      }
    }
  }

  private loadSearchHistory(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        const history = JSON.parse(stored);
        this.searchHistorySignal.set(history);
      }
    } catch (error) {
      console.warn('Unable to load search history from localStorage:', error);
    }
  }

  constructor() {
    this.loadSearchHistory();
  }
}