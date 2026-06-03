import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Song } from '../models';

interface ItunesResponse {
  resultCount: number;
  results: ItunesTrack[];
}

interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  primaryGenreName: string;
  trackTimeMillis: number;
  wrapperType: string;
  kind: string;
}

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly BASE = 'https://itunes.apple.com/search';

  constructor(private http: HttpClient) {}

  private toSong(track: ItunesTrack): Song {
    return {
      trackId: track.trackId,
      trackName: track.trackName,
      artistName: track.artistName,
      collectionName: track.collectionName || '',
      artworkUrl100: (track.artworkUrl100 || '').replace('100x100', '300x300'),
      previewUrl: track.previewUrl || '',
      primaryGenreName: track.primaryGenreName || '',
      trackTimeMillis: track.trackTimeMillis || 0,
    };
  }

  private fetch(term: string, limit = 20): Observable<Song[]> {
    const params = new HttpParams()
      .set('term', term)
      .set('media', 'music')
      .set('entity', 'song')
      .set('limit', limit.toString());

    return this.http.get<ItunesResponse>(this.BASE, { params }).pipe(
      map(res => res.results
        .filter(r => r.wrapperType === 'track' && r.kind === 'song' && r.previewUrl)
        .map(r => this.toSong(r)),
      ),
      catchError(() => of([])),
    );
  }

  search(query: string): Observable<Song[]> {
    if (!query.trim()) return of([]);
    return this.fetch(query);
  }

  getTopCharts(): Observable<Song[]> {
    return this.fetch('top hits 2024', 20);
  }

  getTrending(): Observable<Song[]> {
    return this.fetch('trending music 2024', 10);
  }

  getSongsByArtist(artist: string): Observable<Song[]> {
    return this.fetch(artist, 10);
  }

  getCatalog(): Observable<Song[]> {
    return this.fetch('pop music hits', 20);
  }
}
