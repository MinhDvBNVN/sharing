import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';

import { SearchService, SearchSuggestion } from '../../core/services/search.service';
import { Document, SearchFilters } from '../../core/services/document.service';
import { DocumentCardComponent } from '../../shared/components/document-card.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-search',
  template: `
    <div class="search-container">
      <!-- Search Header -->
      <div class="search-header">
        <h1 class="search-title">Search Knowledge Base</h1>
        <p class="search-subtitle">Find documents, guides, and resources across your organization</p>
      </div>

      <!-- Search Bar -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-bar-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search documents...</mat-label>
              <input matInput 
                     [formControl]="searchControl"
                     [matAutocomplete]="auto"
                     placeholder="Enter keywords, tags, or document names">
              <mat-icon matSuffix (click)="onSearch()">search</mat-icon>
              
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSuggestionSelected($event)">
                @for (suggestion of suggestions(); track $index) {
                  <mat-option [value]="suggestion.text">
                    <div class="suggestion-item">
                      <mat-icon class="suggestion-icon">{{ getSuggestionIcon(suggestion.type) }}</mat-icon>
                      <span class="suggestion-text">{{ suggestion.text }}</span>
                      @if (suggestion.count) {
                        <span class="suggestion-count">({{ suggestion.count }})</span>
                      }
                    </div>
                  </mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="onSearch()" class="search-button">
              <mat-icon>search</mat-icon>
              Search
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="search-content">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <mat-card class="filters-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>filter_list</mat-icon>
                Filters
              </mat-card-title>
              <button mat-icon-button (click)="clearFilters()" matTooltip="Clear all filters">
                <mat-icon>clear</mat-icon>
              </button>
            </mat-card-header>
            
            <mat-card-content>
              <div class="filters-content">
                
                <!-- File Types -->
                <mat-expansion-panel class="filter-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>File Types</mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Select file types</mat-label>
                    <mat-select [formControl]="fileTypesControl" multiple>
                      <mat-option value="pdf">PDF Documents</mat-option>
                      <mat-option value="doc">Word Documents</mat-option>
                      <mat-option value="image">Images</mat-option>
                    </mat-select>
                  </mat-form-field>
                </mat-expansion-panel>

                <!-- Privacy Levels -->
                <mat-expansion-panel class="filter-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Privacy Level</mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Access level</mat-label>
                    <mat-select [formControl]="privacyLevelControl" multiple>
                      <mat-option value="public">Public</mat-option>
                      <mat-option value="group">Team</mat-option>
                      <mat-option value="private">Private</mat-option>
                    </mat-select>
                  </mat-form-field>
                </mat-expansion-panel>

                <!-- Date Range -->
                <mat-expansion-panel class="filter-panel">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Date Range</mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <div class="date-range-container">
                    <mat-form-field appearance="fill">
                      <mat-label>Start date</mat-label>
                      <input matInput [matDatepicker]="startPicker" [formControl]="startDateControl">
                      <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                      <mat-datepicker #startPicker></mat-datepicker>
                    </mat-form-field>
                    
                    <mat-form-field appearance="fill">
                      <mat-label>End date</mat-label>
                      <input matInput [matDatepicker]="endPicker" [formControl]="endDateControl">
                      <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                      <mat-datepicker #endPicker></mat-datepicker>
                    </mat-form-field>
                  </div>
                </mat-expansion-panel>

                <!-- Sort Options -->
                <mat-expansion-panel class="filter-panel" [expanded]="true">
                  <mat-expansion-panel-header>
                    <mat-panel-title>Sort By</mat-panel-title>
                  </mat-expansion-panel-header>
                  
                  <mat-form-field appearance="fill" class="full-width">
                    <mat-label>Sort order</mat-label>
                    <mat-select [formControl]="sortControl">
                      <mat-option value="newest">Newest First</mat-option>
                      <mat-option value="oldest">Oldest First</mat-option>
                      <mat-option value="popular">Most Popular</mat-option>
                      <mat-option value="alphabetical">Alphabetical</mat-option>
                    </mat-select>
                  </mat-form-field>
                </mat-expansion-panel>

              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Search Results -->
        <div class="results-section">
          @if (searchService.searching()) {
            <div class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Searching documents...</p>
            </div>
          } @else if (searchResults().length === 0 && hasSearched()) {
            <div class="empty-results">
              <mat-icon class="empty-icon">search_off</mat-icon>
              <h3>No documents found</h3>
              <p>Try adjusting your search terms or filters</p>
              <button mat-raised-button color="primary" (click)="clearFilters()">
                Clear Filters
              </button>
            </div>
          } @else if (searchResults().length > 0) {
            <div class="results-header">
              <div class="results-info">
                <h2>Search Results</h2>
                <p>{{ totalResults() }} documents found</p>
              </div>
            </div>
            
            <div class="results-grid">
              @for (document of searchResults(); track document.id) {
                <app-document-card
                  [document]="document"
                  [currentUserId]="currentUser()?.id"
                  (view)="onViewDocument($event)"
                  (edit)="onEditDocument($event)"
                  (download)="onDownloadDocument($event)"
                  (star)="onStarDocument($event)">
                </app-document-card>
              }
            </div>

            @if (showLoadMore()) {
              <div class="load-more-container">
                <button mat-raised-button color="primary" (click)="loadMore()" [disabled]="searchService.searching()">
                  @if (searchService.searching()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  }
                  Load More Results
                </button>
              </div>
            }
          } @else {
            <div class="search-placeholder">
              <mat-icon class="placeholder-icon">search</mat-icon>
              <h3>Start your search</h3>
              <p>Enter keywords to find documents across your organization</p>
              
              @if (recentSearches().length > 0) {
                <div class="recent-searches">
                  <h4>Recent Searches</h4>
                  <div class="recent-chips">
                    @for (search of recentSearches(); track $index) {
                      <mat-chip (click)="useRecentSearch(search.query)" class="recent-chip">
                        {{ search.query }}
                        <span class="search-count">({{ search.resultCount }})</span>
                      </mat-chip>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .search-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .search-title {
      font-size: 32px;
      font-weight: 500;
      color: #172b4d;
      margin: 0 0 8px 0;
    }
    
    .search-subtitle {
      font-size: 16px;
      color: #6b778c;
      margin: 0;
    }
    
    .search-card {
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .search-bar-container {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .search-field {
      flex: 1;
    }
    
    .search-button {
      height: 56px;
      padding: 0 24px;
    }
    
    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    
    .suggestion-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b778c;
    }
    
    .suggestion-text {
      flex: 1;
    }
    
    .suggestion-count {
      color: #6b778c;
      font-size: 12px;
    }
    
    .search-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }
    
    .filters-sidebar {
      position: sticky;
      top: 24px;
      height: fit-content;
    }
    
    .filters-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .filters-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .filter-panel {
      box-shadow: none !important;
      border: 1px solid #e4e6ea;
    }
    
    .date-range-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .results-section {
      min-height: 400px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 0;
      text-align: center;
    }
    
    .loading-container p {
      margin-top: 16px;
      color: #6b778c;
    }
    
    .empty-results, .search-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      color: #6b778c;
    }
    
    .empty-icon, .placeholder-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-results h3, .search-placeholder h3 {
      margin: 0 0 8px 0;
      color: #172b4d;
    }
    
    .empty-results p, .search-placeholder p {
      margin: 0 0 24px 0;
    }
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e6ea;
    }
    
    .results-info h2 {
      font-size: 24px;
      font-weight: 500;
      color: #172b4d;
      margin: 0 0 4px 0;
    }
    
    .results-info p {
      color: #6b778c;
      margin: 0;
    }
    
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .load-more-container {
      display: flex;
      justify-content: center;
      padding: 24px 0;
    }
    
    .recent-searches {
      margin-top: 32px;
    }
    
    .recent-searches h4 {
      color: #172b4d;
      margin: 0 0 16px 0;
    }
    
    .recent-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    
    .recent-chip {
      cursor: pointer;
      background-color: #e4e6ea;
      color: #172b4d;
      transition: background-color 0.2s ease;
    }
    
    .recent-chip:hover {
      background-color: #d4d7dc;
    }
    
    .search-count {
      color: #6b778c;
      font-size: 11px;
      margin-left: 4px;
    }
    
    @media (max-width: 768px) {
      .search-content {
        grid-template-columns: 1fr;
      }
      
      .filters-sidebar {
        position: relative;
        top: 0;
      }
      
      .search-bar-container {
        flex-direction: column;
      }
      
      .search-button {
        width: 100%;
        height: 48px;
      }
      
      .results-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    DocumentCardComponent
  ]
})
export class SearchComponent implements OnInit {
  protected searchService = inject(SearchService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  protected currentUser = this.authService.currentUser;
  
  protected searchControl = new FormControl('');
  protected fileTypesControl = new FormControl<string[]>([]);
  protected privacyLevelControl = new FormControl<string[]>([]);
  protected startDateControl = new FormControl();
  protected endDateControl = new FormControl();
  protected sortControl = new FormControl('newest');
  
  protected searchResults = signal<Document[]>([]);
  protected suggestions = signal<SearchSuggestion[]>([]);
  protected recentSearches = signal<any[]>([]);
  protected hasSearched = signal(false);
  protected totalResults = signal(0);
  protected currentPage = signal(1);
  protected showLoadMore = signal(false);

  ngOnInit(): void {
    this.setupAutocomplete();
    this.loadRecentSearches();
  }

  private setupAutocomplete(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.length >= 2) {
          return this.searchService.getSuggestions(query);
        }
        return [];
      })
    ).subscribe(suggestions => {
      this.suggestions.set(suggestions);
    });
  }

  private loadRecentSearches(): void {
    this.searchService.getRecentSearches(5).subscribe(searches => {
      this.recentSearches.set(searches);
    });
  }

  protected onSearch(): void {
    const query = this.searchControl.value;
    if (!query) return;
    
    this.hasSearched.set(true);
    this.currentPage.set(1);
    
    const filters: SearchFilters = {
      query,
      fileType: this.fileTypesControl.value || [],
      privacyLevel: this.privacyLevelControl.value as any || [],
      sortBy: this.sortControl.value as any || 'newest'
    };
    
    if (this.startDateControl.value && this.endDateControl.value) {
      filters.dateRange = {
        start: this.startDateControl.value,
        end: this.endDateControl.value
      };
    }
    
    this.searchService.searchDocuments(query, filters, 1, 20).subscribe({
      next: (response) => {
        this.searchResults.set(response.data);
        this.totalResults.set(response.total);
        this.showLoadMore.set(response.totalPages > 1);
      },
      error: (error) => {
        console.error('Search failed:', error);
        this.searchResults.set([]);
        this.totalResults.set(0);
      }
    });
  }

  protected loadMore(): void {
    const query = this.searchControl.value;
    if (!query) return;
    
    const nextPage = this.currentPage() + 1;
    
    const filters: SearchFilters = {
      query,
      fileType: this.fileTypesControl.value || [],
      privacyLevel: this.privacyLevelControl.value as any || [],
      sortBy: this.sortControl.value as any || 'newest'
    };
    
    this.searchService.searchDocuments(query, filters, nextPage, 20).subscribe({
      next: (response) => {
        const currentResults = this.searchResults();
        this.searchResults.set([...currentResults, ...response.data]);
        this.currentPage.set(nextPage);
        this.showLoadMore.set(nextPage < response.totalPages);
      },
      error: (error) => {
        console.error('Load more failed:', error);
      }
    });
  }

  protected onSuggestionSelected(event: any): void {
    this.searchControl.setValue(event.option.value);
    this.onSearch();
  }

  protected useRecentSearch(query: string): void {
    this.searchControl.setValue(query);
    this.onSearch();
  }

  protected clearFilters(): void {
    this.fileTypesControl.setValue([]);
    this.privacyLevelControl.setValue([]);
    this.startDateControl.setValue(null);
    this.endDateControl.setValue(null);
    this.sortControl.setValue('newest');
    
    if (this.searchControl.value) {
      this.onSearch();
    }
  }

  protected getSuggestionIcon(type: string): string {
    switch (type) {
      case 'tag': return 'local_offer';
      case 'author': return 'person';
      default: return 'search';
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
    // Implementation for starring documents
  }
}