import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { Company, Agreement, AgreementStatus } from '../../core/models/company.model';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './companies-list.component.html',
})
export class CompaniesListComponent implements OnInit {
  Role = Role;
  AgreementStatus = AgreementStatus;

  companies = signal<Company[]>([]);
  totalCompanies = signal<number>(0);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  searchTerm = '';
  selectedSector = '';
  selectedVerified = '';

  // Modales
  showCreateModal = signal<boolean>(false);
  showAgreementModal = signal<boolean>(false);
  selectedCompanyForAgreement = signal<Company | null>(null);

  // Formularios
  companyForm: FormGroup;
  agreementForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  isCoordinatorOrAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR;
  });

  constructor(
    private readonly companyService: CompanyService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.companyForm = this.fb.group({
      legalName: ['', [Validators.required, Validators.maxLength(150)]],
      tradeName: ['', [Validators.maxLength(150)]],
      nit: ['', [Validators.required, Validators.maxLength(30)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      website: [''],
      description: [''],
    });

    this.agreementForm = this.fb.group({
      agreementNumber: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      documentUrl: [''],
      observations: [''],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    let isVerified: boolean | undefined = undefined;
    if (this.selectedVerified === 'true') isVerified = true;
    if (this.selectedVerified === 'false') isVerified = false;

    this.companyService
      .getCompanies({
        search: this.searchTerm || undefined,
        sector: this.selectedSector || undefined,
        isVerified,
        limit: 50,
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.companies.set(res.data.items);
            this.totalCompanies.set(res.data.total);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al cargar el directorio de empresas.',
          );
          this.isLoading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.loadCompanies();
  }

  openCreateModal(): void {
    this.companyForm.reset();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.companyService.createCompany(this.companyForm.value).subscribe({
      next: (res) => {
        this.showSuccess('Empresa registrada exitosamente.');
        this.closeCreateModal();
        this.loadCompanies();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Error al registrar la empresa.',
        );
        this.isLoading.set(false);
      },
    });
  }

  toggleVerification(company: Company): void {
    const newStatus = !company.isVerified;
    this.companyService.verifyCompany(company.id, newStatus).subscribe({
      next: () => {
        this.showSuccess(
          `Estado de verificación de "${company.legalName}" actualizado a: ${
            newStatus ? 'Verificada' : 'Pendiente'
          }`,
        );
        this.loadCompanies();
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || 'Error al actualizar verificación de empresa.',
        );
      },
    });
  }

  openAgreementModal(company: Company): void {
    this.selectedCompanyForAgreement.set(company);
    this.agreementForm.reset();
    this.showAgreementModal.set(true);
  }

  closeAgreementModal(): void {
    this.showAgreementModal.set(false);
    this.selectedCompanyForAgreement.set(null);
  }

  submitAgreement(): void {
    if (this.agreementForm.invalid) {
      this.agreementForm.markAllAsTouched();
      return;
    }

    const company = this.selectedCompanyForAgreement();
    if (!company) return;

    this.isLoading.set(true);
    this.companyService
      .createAgreement(company.id, {
        ...this.agreementForm.value,
        status: this.isCoordinatorOrAdmin()
          ? AgreementStatus.ACTIVE
          : AgreementStatus.PENDING_APPROVAL,
      })
      .subscribe({
        next: () => {
          this.showSuccess('Convenio registrado exitosamente.');
          this.closeAgreementModal();
          this.loadCompanies();
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.message || 'Error al registrar el convenio.',
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
