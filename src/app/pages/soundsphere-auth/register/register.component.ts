import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthLocalService } from '../../../@core/services/auth-local.service';

@Component({
  selector: 'ngx-ss-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  success = false;
  loading = false;

  constructor(private auth: AuthLocalService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    if (!this.name || !this.email || !this.password) {
      this.error = 'Todos los campos son requeridos.';
      return;
    }
    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    this.loading = true;
    const result = this.auth.register(this.name, this.email, this.password);
    this.loading = false;
    if (result.success) {
      this.success = true;
      setTimeout(() => this.router.navigate(['/soundsphere/login']), 2000);
    } else {
      this.error = result.error || 'Error al registrar.';
    }
  }
}
