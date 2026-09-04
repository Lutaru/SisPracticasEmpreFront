import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InternshipService } from '../../core/services/internship.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Internship,
  InternshipReport,
  InternshipStatus,
  ReportStatus,
  ReportType,
} from '../../core/models/internship.model';
import { Role, User } from '../../core/models/user.model';

@Component({
  selector: 'app-internships-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './internships-list.component.html',
})
export class InternshipsListComponent implements OnInit {
  Role = Role;
  InternshipStatus = InternshipStatus;
  ReportType = ReportType;
  ReportStatus = ReportStatus;

  internships = signal<Internship[]>([]);
  myInternship = signal<Internship | null>(null);
  totalInternships = signal<number>(0);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Modales
  showUploadReportModal = signal<boolean>(false);
  showReviewReportModal = signal<boolean>(false);
  selectedReportForReview = signal<InternshipReport | null>(null);
  selectedInternship = signal<Internship | null>(null);

  // Formularios
  reportForm: FormGroup;
  reviewForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  isStudent = computed(() => this.currentUser()?.role === Role.STUDENT);
  isTutor = computed(() => this.currentUser()?.role === Role.TUTOR);
  isCoordinatorOrAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR;
  });

  constructor(
    private readonly internshipService: InternshipService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.reportForm = this.fb.group({
      reportType: [ReportType.INITIAL_PLAN, [Validators.required]],
      fileUrl: ['', [Validators.required]],
      description: [''],
    });

    this.reviewForm = this.fb.group({
      status: [ReportStatus.APPROVED, [Validators.required]],
      tutorObservations: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.isStudent()) {
      this.internshipService.getMyInternship().subscribe({
        next: (res) => {
          if (res.success) {
            this.myInternship.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar tu práctica activa.',
          );
          this.isLoading.set(false);
        },
      });
    } else if (this.isTutor()) {
      this.internshipService.getAssignedToMe().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.internships.set(res.data);
            this.totalInternships.set(res.data.length);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar las prácticas asignadas.',
          );
          this.isLoading.set(false);
        },
      });
    } else {
      this.internshipService.getInternships({ limit: 50 }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.internships.set(res.data.items);
            this.totalInternships.set(res.data.total);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al consultar las prácticas en curso.',
          );
          this.isLoading.set(false);
        },
      });
    }
  }

  openUploadReportModal(internship: Internship): void {
    this.selectedInternship.set(internship);
    this.reportForm.reset({
      reportType: ReportType.INITIAL_PLAN,
    });
    this.showUploadReportModal.set(true);
  }

  closeUploadReportModal(): void {
    this.showUploadReportModal.set(false);
    this.selectedInternship.set(null);
  }

  submitReport(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const internship = this.selectedInternship() || this.myInternship();
    if (!internship) return;

    this.isLoading.set(true);
    this.internshipService
      .submitReport(internship.id, this.reportForm.value)
      .subscribe({
        next: () => {
          this.showSuccess('Informe de práctica entregado con éxito.');
          this.closeUploadReportModal();
          this.loadData();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al entregar el informe de práctica.',
          );
          this.isLoading.set(false);
        },
      });
  }

  openReviewModal(report: InternshipReport): void {
    this.selectedReportForReview.set(report);
    this.reviewForm.reset({
      status: ReportStatus.APPROVED,
      tutorObservations: report.tutorObservations || '',
    });
    this.showReviewReportModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewReportModal.set(false);
    this.selectedReportForReview.set(null);
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const report = this.selectedReportForReview();
    if (!report) return;

    this.isLoading.set(true);
    this.internshipService
      .reviewReport(report.id, this.reviewForm.value)
      .subscribe({
        next: () => {
          this.showSuccess('Revisión y observaciones del informe guardadas exitosamente.');
          this.closeReviewModal();
          this.loadData();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al guardar la revisión del informe.',
          );
          this.isLoading.set(false);
        },
      });
  }

  updateInternshipStatus(internship: Internship, status: InternshipStatus): void {
    this.internshipService.updateStatus(internship.id, status).subscribe({
      next: () => {
        this.showSuccess(`Estado de la práctica actualizado a: ${this.getStatusLabel(status)}`);
        this.loadData();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Error al actualizar estado de la práctica.',
        );
      },
    });
  }

  getStatusBadgeClass(status: InternshipStatus): string {
    switch (status) {
      case InternshipStatus.INITIATED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case InternshipStatus.IN_PROGRESS:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case InternshipStatus.FINAL_EVALUATION:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case InternshipStatus.COMPLETED:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case InternshipStatus.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getStatusLabel(status: InternshipStatus): string {
    switch (status) {
      case InternshipStatus.INITIATED:
        return 'Iniciada';
      case InternshipStatus.IN_PROGRESS:
        return 'En Curso';
      case InternshipStatus.FINAL_EVALUATION:
        return 'Evaluación Final';
      case InternshipStatus.COMPLETED:
        return 'Completada';
      case InternshipStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }

  getReportTypeLabel(type: ReportType): string {
    switch (type) {
      case ReportType.INITIAL_PLAN:
        return 'Plan de Trabajo Inicial';
      case ReportType.PARTIAL_1:
        return 'Informe Parcial 1';
      case ReportType.PARTIAL_2:
        return 'Informe Parcial 2';
      case ReportType.FINAL:
        return 'Informe Final de Práctica';
      default:
        return type;
    }
  }

  getReportStatusBadge(status: ReportStatus): { label: string; class: string } {
    switch (status) {
      case ReportStatus.SUBMITTED:
        return { label: 'Entregado / Pendiente', class: 'bg-blue-50 text-blue-700 border-blue-200' };
      case ReportStatus.APPROVED:
        return { label: 'Aprobado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case ReportStatus.OBSERVED:
        return { label: 'Con Observaciones', class: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4500);
  }
}
