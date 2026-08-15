import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface IProjectDocument {
  id: number;
  fileName: string;
  fileType: string;
  uploadDate: string; 
  fileSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectDocumentsService {
  private http = inject(HttpClient);
  private apiUrl = `/api/project-documents`;

  getDocumentsByProject(projectId: number): Observable<IProjectDocument[]> {
    return this.http.get<any[]>(`${this.apiUrl}/project/${projectId}`).pipe(
      map(docs => (docs || []).map(d => ({
        id: d.idProjectDocument,
        fileName: d.fileName,
        fileType: d.fileName.split('.').pop() || '',
        uploadDate: new Date().toISOString(),
        fileSize: 0
      })))
    );
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }

  getDownloadUrl(documentId: number): string {
    return `${this.apiUrl}/download/${documentId}`;
  }

  downloadDocumentFile(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${documentId}`, { responseType: 'blob' });
  }

  getUploadUrl(): string {
    return `${this.apiUrl}/upload`;
  }

  uploadDocumentFile(file: File, projectId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }
}
