import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Song } from '../../../@core/models';
import { MusicService } from '../../../@core/services/music.service';
import { PlaylistService } from '../../../@core/services/playlist.service';
import { NbToastrService } from '@nebular/theme';
import { AuthLocalService } from '../../../@core/services/auth-local.service';

@Component({
  selector: 'ngx-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  query = '';
  songs: Song[] = [];
  loading = false;
  searched = false;
  selectedSongForPlaylist: Song | null = null;
  showPlaylistPicker = false;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private music: MusicService,
    public playlistService: PlaylistService,
    private auth: AuthLocalService,
    private toastr: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => {
        this.loading = true;
        this.searched = true;
        return this.music.search(q);
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: songs => {
        this.songs = songs;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLoggedIn(): boolean { return this.auth.isLoggedIn(); }

  onSearch(): void {
    if (this.query.trim()) this.searchSubject.next(this.query.trim());
  }

  clearSearch(): void {
    this.query = '';
    this.songs = [];
    this.searched = false;
  }

  onAddToPlaylist(song: Song): void {
    this.selectedSongForPlaylist = song;
    this.showPlaylistPicker = true;
  }

  addToPlaylist(playlistId: string): void {
    if (!this.selectedSongForPlaylist) return;
    this.playlistService.addSongToPlaylist(playlistId, this.selectedSongForPlaylist);
    this.toastr.success('Canción agregada a la playlist', 'Listo');
    this.showPlaylistPicker = false;
  }

  cancelPlaylistPicker(): void {
    this.showPlaylistPicker = false;
    this.selectedSongForPlaylist = null;
  }

  trackBySong(_: number, song: Song): number { return song.trackId; }
}
