import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Song } from '../../../@core/models';
import { PlayerService } from '../../../@core/services/player.service';

@Component({
  selector: 'ngx-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
})
export class MiniPlayerComponent implements OnInit, OnDestroy {
  currentSong: Song | null = null;
  isPlaying = false;
  progress = 0;
  duration = 0;
  private destroy$ = new Subject<void>();

  constructor(public player: PlayerService) {}

  ngOnInit(): void {
    this.player.currentSong$.pipe(takeUntil(this.destroy$)).subscribe(s => this.currentSong = s);
    this.player.isPlaying$.pipe(takeUntil(this.destroy$)).subscribe(p => this.isPlaying = p);
    this.player.progress$.pipe(takeUntil(this.destroy$)).subscribe(p => this.progress = p);
    this.player.duration$.pipe(takeUntil(this.destroy$)).subscribe(d => this.duration = d);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get progressPercent(): number {
    return this.duration > 0 ? (this.progress / this.duration) * 100 : 0;
  }

  onSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.seek(+input.value);
  }

  formatTime(s: number): string {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  stop(): void { this.player.stop(); }
}
