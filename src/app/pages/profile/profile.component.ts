import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NbToastrService } from '@nebular/theme';
import { AuthLocalService } from '../../@core/services/auth-local.service';
import { FavoritesService } from '../../@core/services/favorites.service';
import { PlaylistService } from '../../@core/services/playlist.service';
import { User } from '../../@core/models';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  name = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  avatarPreview = '';
  error = '';
  success = '';
  stats = { favorites: 0, playlists: 0, totalSongs: 0 };
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthLocalService,
    private toastr: NbToastrService,
    private favoritesService: FavoritesService,
    private playlistService: PlaylistService,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    if (this.user) {
      this.name = this.user.name;
      this.avatarPreview = this.user.avatarUrl || '';
    }

    this.favoritesService.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favs => {
      this.stats.favorites = favs.length;
    });

    this.playlistService.playlists$.pipe(takeUntil(this.destroy$)).subscribe(pls => {
      this.stats.playlists = pls.length;
      this.stats.totalSongs = pls.reduce((sum, p) => sum + p.songs.length, 0);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get memberSince(): string {
    if (!this.user?.createdAt) return '';
    return new Date(this.user.createdAt).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.avatarPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    this.error = '';
    this.success = '';
    if (!this.name.trim()) {
      this.error = 'El nombre no puede estar vacío.';
      return;
    }
    const update: Partial<User> = { name: this.name.trim() };
    if (this.avatarPreview) update.avatarUrl = this.avatarPreview;

    if (this.newPassword) {
      if (this.newPassword.length < 8) {
        this.error = 'La nueva contraseña debe tener al menos 8 caracteres.';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Las contraseñas no coinciden.';
        return;
      }
      if (!this.currentPassword || btoa(this.currentPassword) !== this.user?.password) {
        this.error = 'La contraseña actual es incorrecta.';
        return;
      }
      update.password = btoa(this.newPassword);
    }

    this.auth.updateUser(update);
    this.user = this.auth.getCurrentUser();
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.toastr.success('Perfil actualizado correctamente', 'Perfil');
    this.success = 'Cambios guardados.';
  }
}
