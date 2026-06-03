import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio = new Audio();

  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);

  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  duration$ = this.durationSubject.asObservable();

  get currentSongValue(): Song | null { return this.currentSongSubject.value; }
  get isPlayingValue(): boolean { return this.isPlayingSubject.value; }

  constructor() {
    this.audio.addEventListener('timeupdate', () => {
      this.progressSubject.next(this.audio.currentTime);
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio.duration);
    });
    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
      this.progressSubject.next(0);
    });
    this.audio.addEventListener('error', () => {
      this.isPlayingSubject.next(false);
    });
  }

  play(song: Song): void {
    if (!song.previewUrl) return;
    if (this.currentSongSubject.value?.trackId !== song.trackId) {
      this.audio.src = song.previewUrl;
      this.audio.load();
      this.currentSongSubject.next(song);
    }
    this.audio.play().then(() => {
      this.isPlayingSubject.next(true);
    }).catch(() => {
      this.isPlayingSubject.next(false);
    });
  }

  pause(): void {
    this.audio.pause();
    this.isPlayingSubject.next(false);
  }

  toggle(song: Song): void {
    if (this.currentSongSubject.value?.trackId === song.trackId && this.isPlayingValue) {
      this.pause();
    } else {
      this.play(song);
    }
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlayingSubject.next(false);
    this.currentSongSubject.next(null);
  }
}
