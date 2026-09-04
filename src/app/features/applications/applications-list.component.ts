import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './applications-list.component.html',
})
export class ApplicationsListComponent implements OnInit {
  Role = Role;
  ApplicationStatus = ApplicationStatus;

  applications = signal<Application[]>([]);
  totalApplications = signal<number>(0);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  selectedStatus = '';

  // Modales
  showStatusModal = signal<boolean>(false);
  selectedAppForAction = signal<Application | null>(null);
  selectedAppForDetail = signal<Application | null>(null);

  // Formulario de cambio de estado
  statusForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  isStudent = computed(() => this.currentUser()?.role === Role.STUDENT);
  canManage = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR || role === Role.COMPANY;
  });

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.statusForm = this.fb.group({
      status: [ApplicationStatus.PRESELECTED, [Validators.required]],
      feedback: [''],
      interviewDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filter = {
      status: (this.selectedStatus as ApplicationStatus) || undefined,
      limit: 50,
    };

    if (this.isStudent()) {
      this.applicationService.getMyApplications().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            let list = res.data;
            if (this.selectedStatus) {
              list = list.filter((a) => a.status === this.selectedStatus);
            }
            this.applications.set(list);
            this.totalApplications.set(list.length);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar tus postulaciones.',
          );
          this.isLoading.set(false);
        },
      });
    } else {
      this.applicationService.getApplications(filter).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.applications.set(res.data.items);
            this.totalApplications.set(res.data.total);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar el panel de postulaciones.',
          );
          this.isLoading.set(false);
        },
      });
    }
  }

  onFilterChange(): void {
    this.loadApplications();
  }

  openStatusModal(app: Application): void {
    this.selectedAppForAction.set(app);
    this.statusForm.reset({
      status: app.status,
      feedback: app.feedback || '',
      interviewDate: app.interviewDate ? new Date(app.interviewDate).toISOString().slice(0, 16) : '',
    });
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
    this.selectedAppForAction.set(null);
  }

  submitStatus(): void {
    if (this.statusForm.invalid) return;

    const app = this.selectedAppForAction();
    if (!app) return;

    const val = this.statusForm.value;
    this.isLoading.set(true);

    this.applicationService
      .updateStatus(
        app.id,
        val.status,
        val.feedback || undefined,
        val.interviewDate ? new Date(val.interviewDate).toISOString() : undefined,
      )
      .subscribe({
        next: () => {
          this.showSuccess('Estado de la postulación actualizado correctamente.');
          this.closeStatusModal();
          this.loadApplications();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al actualizar el estado de la postulación.',
          );
          this.isLoading.set(false);
        },
      });
  }

  openDetail(app: Application): void {
    this.selectedAppForDetail.set(app);
  }

  closeDetail(): void {
    this.selectedAppForDetail.set(null);
  }

  getStatusBadge(status: ApplicationStatus): { label: string; class: string } {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
        return {
          label: 'Postulado',
          class: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case ApplicationStatus.PRESELECTED:
        return {
          label: 'Preseleccionado',
          class: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case ApplicationStatus.INTERVIEW_SCHEDULED:
        return {
          label: 'Entrevista Agendada',
          class: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case ApplicationStatus.ACCEPTED:
        return {
          label: 'Aceptado para Práctica',
          class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case ApplicationStatus.REJECTED:
        return {
          label: 'No Seleccionado',
          class: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      default:
        return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4500);
  }
}
