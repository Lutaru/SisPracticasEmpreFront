import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Role, User } from '../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent implements OnInit {
  Role = Role;

  users = signal<User[]>([]);
  totalUsers = signal<number>(0);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  searchTerm = signal<string>('');
  roleFilter = signal<string>('ALL');
  statusFilter = signal<string>('ALL');

  // Modales
  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  selectedUser = signal<User | null>(null);

  createForm: FormGroup;
  editForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);

  filteredUsers = computed<User[]>(() => {
    const list = this.users();
    const term = this.searchTerm().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return list.filter((u) => {
      const matchSearch =
        !term ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.documentNumber?.toLowerCase().includes(term);

      const matchRole = role === 'ALL' || u.role === role;

      const matchStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && u.isActive) ||
        (status === 'INACTIVE' && !u.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  });

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.createForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      documentType: ['CC', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.pattern(/^[0-9+ ]*$/)]],
      role: [Role.STUDENT, [Validators.required]],
    });

    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^[0-9+ ]*$/)]],
      role: [Role.STUDENT, [Validators.required]],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers({ limit: 100 }).subscribe({
      next: (res) => {
        this.users.set(res.data.items || []);
        this.totalUsers.set(res.data.total || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al cargar listado de usuarios');
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.createForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      documentType: 'CC',
      documentNumber: '',
      phone: '',
      role: Role.STUDENT,
    });
    this.showCreateModal.set(true);
    this.errorMessage.set(null);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.userService.createUser(this.createForm.value).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.successMessage.set(`Usuario ${res.data.firstName} ${res.data.lastName} creado correctamente`);
        this.loadUsers();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al crear usuario');
      },
    });
  }

  openEditModal(user: User): void {
    this.selectedUser.set(user);
    this.editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive ?? true,
    });
    this.showEditModal.set(true);
    this.errorMessage.set(null);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedUser.set(null);
  }

  submitEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const user = this.selectedUser();
    if (!user) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.userService.updateUser(user.id, this.editForm.value).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.closeEditModal();
        this.successMessage.set(`Usuario ${res.data.firstName} ${res.data.lastName} actualizado`);
        this.loadUsers();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar usuario');
      },
    });
  }

  toggleStatus(user: User): void {
    if (!this.isAdmin()) return;

    const action = user.isActive ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de que desea ${action} al usuario ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    this.userService.toggleStatus(user.id).subscribe({
      next: (res) => {
        this.successMessage.set(
          `Estado de ${res.data.firstName} ${res.data.lastName} actualizado a ${res.data.isActive ? 'Activo' : 'Inactivo'}`,
        );
        this.loadUsers();
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'No se pudo cambiar el estado del usuario');
      },
    });
  }
}
