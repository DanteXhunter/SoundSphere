import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Song } from '../../../@core/models';
import { PlayerService } from '../../../@core/services/player.service';
import { FavoritesService } from '../../../@core/services/favorites.service';
import { AuthLocalService } from '../../../@core/services/auth-local.service';

@Component({
  selector: 'ngx-song-card',
  templateUrl: './song-card.component.html',
  styleUrls: ['./song-card.component.scss'],
})
export class SongCardComponent implements OnInit {
  @Input() song: Song;
  @Output() addToPlaylist = new EventEmitter<Song>();

  isPlaying = false;
  isFavorite = false;
  isLoggedIn = false;

  constructor(
    public player: PlayerService,
    private favorites: FavoritesService,
    private auth: AuthLocalService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.isFavorite = this.favorites.isFavorite(this.song.trackId);

    this.player.currentSong$.subscribe(current => {
      this.isPlaying = current?.trackId === this.song.trackId && this.player.isPlayingValue;
    });
    this.player.isPlaying$.subscribe(playing => {
      if (this.player.currentSongValue?.trackId === this.song.trackId) {
        this.isPlaying = playing;
      }
    });
    this.favorites.favorites$.subscribe(() => {
      this.isFavorite = this.favorites.isFavorite(this.song.trackId);
    });
  }

  togglePlay(): void {
    this.player.toggle(this.song);
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn) return;
    if (this.isFavorite) {
      this.favorites.removeFavorite(this.song.trackId);
    } else {
      this.favorites.addFavorite(this.song);
    }
  }

  formatDuration(ms: number): string {
    if (!ms) return '0:00';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  }
}
