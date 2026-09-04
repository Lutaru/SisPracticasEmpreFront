import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OfferService } from '../../core/services/offer.service';
import { CompanyService } from '../../core/services/company.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { InternshipOffer, OfferModality, OfferStatus } from '../../core/models/offer.model';
import { Company } from '../../core/models/company.model';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './offers-list.component.html',
})
export class OffersListComponent implements OnInit {
  Role = Role;
  OfferModality = OfferModality;
  OfferStatus = OfferStatus;

  offers = signal<InternshipOffer[]>([]);
  totalOffers = signal<number>(0);
  companies = signal<Company[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  searchTerm = '';
  selectedModality = '';
  selectedProfile = '';

  // Modales
  showCreateModal = signal<boolean>(false);
  selectedOfferForDetail = signal<InternshipOffer | null>(null);
  showApplyModal = signal<boolean>(false);
  selectedOfferForApply = signal<InternshipOffer | null>(null);

  // Formularios
  offerForm: FormGroup;
  applyForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  canPublish = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR || role === Role.COMPANY;
  });
  isStudent = computed(() => this.currentUser()?.role === Role.STUDENT);
  isCoordinatorOrAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR;
  });

  constructor(
    private readonly offerService: OfferService,
    private readonly companyService: CompanyService,
    private readonly applicationService: ApplicationService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.offerForm = this.fb.group({
      companyId: [''],
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required]],
      requirements: ['', [Validators.required]],
      profileNeeded: ['', [Validators.required, Validators.maxLength(100)]],
      vacancies: [1, [Validators.required, Validators.min(1)]],
      salaryCompensation: [''],
      modality: [OfferModality.HYBRID, [Validators.required]],
      location: ['', [Validators.required]],
      expiresAt: [''],
    });

    this.applyForm = this.fb.group({
      resumeUrl: [''],
      coverLetter: [''],
    });
  }

  ngOnInit(): void {
    this.loadOffers();
    if (this.isCoordinatorOrAdmin()) {
      this.loadCompaniesForSelect();
    }
  }

  loadOffers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.offerService
      .getOffers({
        search: this.searchTerm || undefined,
        modality: (this.selectedModality as OfferModality) || undefined,
        profileNeeded: this.selectedProfile || undefined,
        limit: 50,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.offers.set(res.data.items);
            this.totalOffers.set(res.data.total);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar las convocatorias de prácticas.',
          );
          this.isLoading.set(false);
        },
      });
  }

  loadCompaniesForSelect(): void {
    this.companyService.getCompanies({ isVerified: true, limit: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companies.set(res.data.items);
        }
      },
    });
  }

  onFilterChange(): void {
    this.loadOffers();
  }

  openCreateModal(): void {
    this.offerForm.reset({
      vacancies: 1,
      modality: OfferModality.HYBRID,
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitOffer(): void {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.offerForm.value };
    if (!payload.companyId) {
      delete payload.companyId;
    }

    this.isLoading.set(true);
    this.offerService.createOffer(payload).subscribe({
      next: () => {
        this.showSuccess('Convocatoria de práctica publicada exitosamente.');
        this.closeCreateModal();
        this.loadOffers();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Error al publicar la convocatoria.',
        );
        this.isLoading.set(false);
      },
    });
  }

  toggleOfferStatus(offer: InternshipOffer): void {
    const newStatus =
      offer.status === OfferStatus.OPEN ? OfferStatus.CLOSED : OfferStatus.OPEN;
    this.offerService.updateOfferStatus(offer.id, newStatus).subscribe({
      next: () => {
        this.showSuccess(
          `Estado de la oferta actualizado a: ${newStatus === OfferStatus.OPEN ? 'Abierta' : 'Cerrada'}`,
        );
        this.loadOffers();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Error al cambiar estado de la oferta.',
        );
      },
    });
  }

  openDetail(offer: InternshipOffer): void {
    this.selectedOfferForDetail.set(offer);
  }

  closeDetail(): void {
    this.selectedOfferForDetail.set(null);
  }

  getModalityBadgeClass(modality: OfferModality): string {
    switch (modality) {
      case OfferModality.REMOTE:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case OfferModality.ON_SITE:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case OfferModality.HYBRID:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  getModalityLabel(modality: OfferModality): string {
    switch (modality) {
      case OfferModality.REMOTE:
        return 'Remota';
      case OfferModality.ON_SITE:
        return 'Presencial';
      case OfferModality.HYBRID:
        return 'Híbrida';
      default:
        return modality;
    }
  }

  openApplyModal(offer: InternshipOffer): void {
    this.selectedOfferForApply.set(offer);
    this.applyForm.reset();
    this.showApplyModal.set(true);
  }

  closeApplyModal(): void {
    this.showApplyModal.set(false);
    this.selectedOfferForApply.set(null);
  }

  submitApplication(): void {
    const offer = this.selectedOfferForApply();
    if (!offer) return;

    this.isLoading.set(true);
    this.applicationService
      .apply({
        offerId: offer.id,
        resumeUrl: this.applyForm.value.resumeUrl || undefined,
        coverLetter: this.applyForm.value.coverLetter || undefined,
      })
      .subscribe({
        next: () => {
          this.showSuccess(`¡Te has postulado con éxito a "${offer.title}"!`);
          this.closeApplyModal();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al enviar la postulación a la práctica.',
          );
          this.isLoading.set(false);
        },
      });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4500);
  }
}
