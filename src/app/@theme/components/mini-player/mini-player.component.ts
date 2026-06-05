import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Song } from '../../../@core/models';
import { PlayerService } from '../../../@core/services/player.service';
import { FavoritesService } from '../../../@core/services/favorites.service';
import { AuthLocalService } from '../../../@core/services/auth-local.service';

@Component({
  selector: 'ngx-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
})
export class MiniPlayerComponent implements OnInit, OnDestroy {
  currentSong: Song | null = null;
  isPlaying = false;
  isLoading = false;
  progress = 0;
  duration = 0;
  isFavorite = false;
  isLoggedIn = false;

  private destroy$ = new Subject<void>();

  constructor(
    public player: PlayerService,
    private favorites: FavoritesService,
    private auth: AuthLocalService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();

    combineLatest([
      this.player.currentSong$,
      this.player.isPlaying$,
      this.player.loading$,
      this.player.progress$,
      this.player.duration$,
    ]).pipe(takeUntil(this.destroy$)).subscribe(
      ([song, playing, loading, progress, duration]) => {
        this.currentSong = song;
        this.isPlaying = playing;
        this.isLoading = loading;
        this.progress = progress;
        this.duration = duration;
        if (song) {
          this.isFavorite = this.favorites.isFavorite(song.trackId);
        }
      },
    );

    this.favorites.favorites$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.currentSong) {
        this.isFavorite = this.favorites.isFavorite(this.currentSong.trackId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFavorite(): void {
    if (!this.currentSong || !this.isLoggedIn) return;
    if (this.isFavorite) {
      this.favorites.removeFavorite(this.currentSong.trackId);
    } else {
      this.favorites.addFavorite(this.currentSong);
    }
  }

  get progressPercent(): number {
    return this.duration > 0 ? (this.progress / this.duration) * 100 : 0;
  }

  onSeek(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.player.seek(val);
  }

  formatTime(sec: number): string {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get playIcon(): string {
    if (this.isLoading) return 'loader-outline';
    return this.isPlaying ? 'pause-circle-outline' : 'play-circle-outline';
  }
}
