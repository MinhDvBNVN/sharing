import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { User } from '../auth/auth.service';
import { Document, Tag } from './document.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockUserSignal = signal<User>({
    id: 'user-1',
    username: 'john.doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    role: 'user'
  });

  private mockTags: Tag[] = [
    { id: 'tag-1', name: 'Documentation', color: '#0052CC' },
    { id: 'tag-2', name: 'Tutorial', color: '#36B37E' },
    { id: 'tag-3', name: 'API', color: '#FF8B00' },
    { id: 'tag-4', name: 'Getting Started', color: '#6554C0' },
    { id: 'tag-5', name: 'Best Practices', color: '#00875A' },
    { id: 'tag-6', name: 'Architecture', color: '#DE350B' },
    { id: 'tag-7', name: 'Frontend', color: '#0052CC' },
    { id: 'tag-8', name: 'Backend', color: '#FF8B00' },
    { id: 'tag-9', name: 'DevOps', color: '#6554C0' },
    { id: 'tag-10', name: 'Security', color: '#DE350B' }
  ];

  private mockDocuments: Document[] = [
    {
      id: 'doc-1',
      title: 'Getting Started with Our Platform',
      summary: 'A comprehensive guide to help new team members get up and running with our development platform. Covers installation, setup, and basic workflows.',
      fileUrl: '/assets/docs/getting-started.pdf',
      fileType: 'application/pdf',
      fileSize: 2048576, // 2MB
      ownerId: 'user-1',
      ownerName: 'John Doe',
      privacyLevel: 'public',
      tags: [this.mockTags[0], this.mockTags[3]],
      rating: 4.8,
      viewCount: 245,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'doc-2',
      title: 'API Documentation v2.1',
      summary: 'Complete API reference documentation including endpoints, request/response examples, authentication, and error handling.',
      fileUrl: '/assets/docs/api-docs.pdf',
      fileType: 'application/pdf',
      fileSize: 4194304, // 4MB
      ownerId: 'user-2',
      ownerName: 'Jane Smith',
      privacyLevel: 'public',
      tags: [this.mockTags[0], this.mockTags[2]],
      rating: 4.6,
      viewCount: 189,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-15')
    },
    {
      id: 'doc-3',
      title: 'Frontend Architecture Guidelines',
      summary: 'Best practices and architectural patterns for our Angular frontend applications. Includes coding standards, component structure, and testing strategies.',
      fileUrl: '/assets/docs/frontend-arch.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 1572864, // 1.5MB
      ownerId: 'user-1',
      ownerName: 'John Doe',
      privacyLevel: 'group',
      tags: [this.mockTags[4], this.mockTags[5], this.mockTags[6]],
      rating: 4.9,
      viewCount: 156,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-25')
    },
    {
      id: 'doc-4',
      title: 'Database Migration Guide',
      summary: 'Step-by-step instructions for migrating from our legacy database to the new PostgreSQL setup. Includes scripts and rollback procedures.',
      fileUrl: '/assets/docs/db-migration.pdf',
      fileType: 'application/pdf',
      fileSize: 3145728, // 3MB
      ownerId: 'user-3',
      ownerName: 'Mike Johnson',
      privacyLevel: 'group',
      tags: [this.mockTags[0], this.mockTags[7]],
      rating: 4.2,
      viewCount: 89,
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: 'doc-5',
      title: 'Security Best Practices 2024',
      summary: 'Updated security guidelines covering authentication, authorization, data encryption, and vulnerability management for our applications.',
      fileUrl: '/assets/docs/security-guide.pdf',
      fileType: 'application/pdf',
      fileSize: 2621440, // 2.5MB
      ownerId: 'user-4',
      ownerName: 'Sarah Wilson',
      privacyLevel: 'public',
      tags: [this.mockTags[4], this.mockTags[9]],
      rating: 4.7,
      viewCount: 312,
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: 'doc-6',
      title: 'CI/CD Pipeline Setup',
      summary: 'Complete guide for setting up continuous integration and deployment pipelines using GitHub Actions and AWS. Includes configuration examples and troubleshooting.',
      fileUrl: '/assets/docs/cicd-setup.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 1048576, // 1MB
      ownerId: 'user-5',
      ownerName: 'David Brown',
      privacyLevel: 'public',
      tags: [this.mockTags[1], this.mockTags[8]],
      rating: 4.4,
      viewCount: 178,
      createdAt: new Date('2024-03-12'),
      updatedAt: new Date('2024-03-15')
    },
    {
      id: 'doc-7',
      title: 'Mobile App Development Standards',
      summary: 'Coding standards and best practices for our React Native mobile applications. Covers navigation, state management, and performance optimization.',
      fileUrl: '/assets/docs/mobile-standards.pdf',
      fileType: 'application/pdf',
      fileSize: 1835008, // 1.75MB
      ownerId: 'user-1',
      ownerName: 'John Doe',
      privacyLevel: 'group',
      tags: [this.mockTags[4], this.mockTags[6]],
      rating: 4.3,
      viewCount: 134,
      createdAt: new Date('2024-03-18'),
      updatedAt: new Date('2024-03-22')
    },
    {
      id: 'doc-8',
      title: 'Testing Strategy and Guidelines',
      summary: 'Comprehensive testing strategy covering unit tests, integration tests, and e2e testing. Includes Jest configuration and best practices.',
      fileUrl: '/assets/docs/testing-guide.pdf',
      fileType: 'application/pdf',
      fileSize: 2359296, // 2.25MB
      ownerId: 'user-2',
      ownerName: 'Jane Smith',
      privacyLevel: 'public',
      tags: [this.mockTags[1], this.mockTags[4]],
      rating: 4.5,
      viewCount: 201,
      createdAt: new Date('2024-03-25'),
      updatedAt: new Date('2024-03-28')
    }
  ];

  public readonly mockUser = this.mockUserSignal.asReadonly();

  getMockUser(): User {
    return this.mockUserSignal();
  }

  getAllDocuments(): Observable<Document[]> {
    return of(this.mockDocuments).pipe(delay(500));
  }

  getRecentDocuments(limit = 5): Observable<Document[]> {
    const recent = [...this.mockDocuments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return of(recent).pipe(delay(300));
  }

  getPopularDocuments(limit = 5): Observable<Document[]> {
    const popular = [...this.mockDocuments]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
    return of(popular).pipe(delay(300));
  }

  getMyDocuments(userId: string, limit?: number): Observable<Document[]> {
    let myDocs = this.mockDocuments.filter(doc => doc.ownerId === userId);
    if (limit) {
      myDocs = myDocs.slice(0, limit);
    }
    return of(myDocs).pipe(delay(300));
  }

  getDocumentById(id: string): Observable<Document | null> {
    const doc = this.mockDocuments.find(d => d.id === id) || null;
    return of(doc).pipe(delay(200));
  }

  searchDocuments(query: string, filters?: any): Observable<Document[]> {
    let results = this.mockDocuments;
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.summary.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters?.fileType?.length) {
      results = results.filter(doc => {
        return filters.fileType.some((type: string) => {
          if (type === 'pdf') return doc.fileType.includes('pdf');
          if (type === 'doc') return doc.fileType.includes('document') || doc.fileType.includes('word');
          if (type === 'image') return doc.fileType.includes('image');
          return false;
        });
      });
    }
    
    if (filters?.privacyLevel?.length) {
      results = results.filter(doc => filters.privacyLevel.includes(doc.privacyLevel));
    }
    
    return of(results).pipe(delay(800));
  }

  getMockTags(): Tag[] {
    return [...this.mockTags];
  }

  addMockDocument(doc: Partial<Document>): Observable<Document> {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: doc.title || 'Untitled Document',
      summary: doc.summary || '',
      fileUrl: doc.fileUrl || '/assets/docs/placeholder.pdf',
      fileType: doc.fileType || 'application/pdf',
      fileSize: doc.fileSize || 1048576,
      ownerId: doc.ownerId || this.mockUserSignal().id,
      ownerName: doc.ownerName || this.mockUserSignal().username,
      privacyLevel: doc.privacyLevel || 'private',
      tags: doc.tags || [],
      rating: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockDocuments.unshift(newDoc);
    return of(newDoc).pipe(delay(1000));
  }
}