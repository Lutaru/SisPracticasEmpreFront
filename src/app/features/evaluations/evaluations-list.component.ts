import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InternshipService } from '../../core/services/internship.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Internship,
  InternshipStatus,
} from '../../core/models/internship.model';
import {
  Evaluation,
  EvaluationSummary,
  EvaluationType,
  RubricCriterion,
  COMPANY_RUBRIC_CRITERIA,
  TUTOR_RUBRIC_CRITERIA,
} from '../../core/models/evaluation.model';
import { Role } from '../../core/models/user.model';

@Component({
  selector: 'app-evaluations-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './evaluations-list.component.html',
})
export class EvaluationsListComponent implements OnInit {
  Role = Role;
  InternshipStatus = InternshipStatus;
  EvaluationType = EvaluationType;

  internships = signal<Internship[]>([]);
  summaries = signal<Record<string, EvaluationSummary>>({});
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  // Modales
  showRubricModal = signal<boolean>(false);
  showSummaryModal = signal<boolean>(false);
  selectedInternship = signal<Internship | null>(null);
  activeSummary = signal<EvaluationSummary | null>(null);
  activeEvaluationType = signal<EvaluationType>(EvaluationType.COMPANY);

  // Rúbrica interactiva
  activeCriteria = computed<RubricCriterion[]>(() => {
    return this.activeEvaluationType() === EvaluationType.COMPANY
      ? COMPANY_RUBRIC_CRITERIA
      : TUTOR_RUBRIC_CRITERIA;
  });

  criteriaScores = signal<Record<string, number>>({});
  evaluationForm: FormGroup;

  currentUser = computed(() => this.authService.currentUser());
  isStudent = computed(() => this.currentUser()?.role === Role.STUDENT);
  isCompany = computed(() => this.currentUser()?.role === Role.COMPANY);
  isTutor = computed(() => this.currentUser()?.role === Role.TUTOR);
  isCoordinatorOrAdmin = computed(() => {
    const role = this.currentUser()?.role;
    return role === Role.ADMIN || role === Role.COORDINATOR;
  });

  // Cálculo de promedio en tiempo real
  calculatedScore = computed<number>(() => {
    const scores = this.criteriaScores();
    const criteria = this.activeCriteria();
    if (!criteria.length) return 0;

    let total = 0;
    for (const c of criteria) {
      total += scores[c.id] ?? 3.5;
    }
    return Number((total / criteria.length).toFixed(2));
  });

  // Filtrado de lista
  filteredInternships = computed<Internship[]>(() => {
    const list = this.internships();
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return list.filter((item) => {
      const matchSearch =
        !term ||
        item.student?.firstName?.toLowerCase().includes(term) ||
        item.student?.lastName?.toLowerCase().includes(term) ||
        item.student?.documentNumber?.toLowerCase().includes(term) ||
        item.company?.legalName?.toLowerCase().includes(term);

      const matchStatus = status === 'ALL' || item.status === status;

      return matchSearch && matchStatus;
    });
  });

  constructor(
    private readonly internshipService: InternshipService,
    private readonly evaluationService: EvaluationService,
    private readonly authService: AuthService,
    private readonly fb: FormBuilder,
  ) {
    this.evaluationForm = this.fb.group({
      strengths: ['', [Validators.required, Validators.minLength(10)]],
      improvements: ['', [Validators.required, Validators.minLength(10)]],
      recommendations: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const user = this.currentUser();
    if (!user) {
      this.isLoading.set(false);
      return;
    }

    if (user.role === Role.STUDENT) {
      this.internshipService.getMyInternship().subscribe({
        next: (res) => {
          if (res.data) {
            this.internships.set([res.data]);
            this.loadSummaryForInternship(res.data.id);
          } else {
            this.internships.set([]);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al cargar su práctica profesional');
          this.isLoading.set(false);
        },
      });
    } else if (user.role === Role.TUTOR) {
      this.internshipService.getAssignedToMe().subscribe({
        next: (res) => {
          const list = res.data || [];
          this.internships.set(list);
          list.forEach((i) => this.loadSummaryForInternship(i.id));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al cargar prácticas asignadas');
          this.isLoading.set(false);
        },
      });
    } else {
      // ADMIN, COORDINATOR, COMPANY
      this.internshipService.getInternships({ limit: 50 }).subscribe({
        next: (res) => {
          const list = res.data.items || [];
          this.internships.set(list);
          list.forEach((i) => this.loadSummaryForInternship(i.id));
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error al cargar prácticas profesionales');
          this.isLoading.set(false);
        },
      });
    }
  }

  private loadSummaryForInternship(internshipId: string): void {
    this.evaluationService.getInternshipSummary(internshipId).subscribe({
      next: (res) => {
        if (res.data) {
          this.summaries.update((current) => ({
            ...current,
            [internshipId]: res.data,
          }));
        }
      },
      error: () => {},
    });
  }

  canEvaluateAsCompany(internship: Internship): boolean {
    if (internship.status === InternshipStatus.CANCELLED) return false;
    if (this.isCoordinatorOrAdmin()) return true;
    if (this.isCompany()) {
      return internship.company?.userId === this.currentUser()?.id;
    }
    return false;
  }

  canEvaluateAsTutor(internship: Internship): boolean {
    if (internship.status === InternshipStatus.CANCELLED) return false;
    if (this.isCoordinatorOrAdmin()) return true;
    if (this.isTutor()) {
      return internship.tutorId === this.currentUser()?.id;
    }
    return false;
  }

  openRubricModal(internship: Internship, type: EvaluationType): void {
    this.selectedInternship.set(internship);
    this.activeEvaluationType.set(type);
    this.errorMessage.set(null);

    // Cargar si ya existía evaluación previa
    const summary = this.summaries()[internship.id];
    const prevEval =
      type === EvaluationType.COMPANY
        ? summary?.companyEvaluation
        : summary?.tutorEvaluation;

    const criteria =
      type === EvaluationType.COMPANY
        ? COMPANY_RUBRIC_CRITERIA
        : TUTOR_RUBRIC_CRITERIA;

    const initialScores: Record<string, number> = {};
    for (const c of criteria) {
      if (prevEval && prevEval.criteriaScores && prevEval.criteriaScores[c.id] !== undefined) {
        initialScores[c.id] = Number(prevEval.criteriaScores[c.id]);
      } else {
        initialScores[c.id] = 4.0;
      }
    }
    this.criteriaScores.set(initialScores);

    this.evaluationForm.reset({
      strengths: prevEval?.strengths || '',
      improvements: prevEval?.improvements || '',
      recommendations: prevEval?.recommendations || '',
    });

    this.showRubricModal.set(true);
  }

  closeRubricModal(): void {
    this.showRubricModal.set(false);
    this.selectedInternship.set(null);
  }

  updateCriterionScore(criterionId: string, value: string | number): void {
    const num = Math.min(5, Math.max(0, Number(value) || 0));
    this.criteriaScores.update((current) => ({
      ...current,
      [criterionId]: num,
    }));
  }

  submitEvaluation(): void {
    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      return;
    }

    const internship = this.selectedInternship();
    if (!internship) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formVal = this.evaluationForm.value;
    const payload = {
      internshipId: internship.id,
      evaluatorType: this.activeEvaluationType(),
      score: this.calculatedScore(),
      criteriaScores: this.criteriaScores(),
      strengths: formVal.strengths,
      improvements: formVal.improvements,
      recommendations: formVal.recommendations,
    };

    this.evaluationService.createEvaluation(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeRubricModal();
        this.successMessage.set(
          `Evaluación ${
            this.activeEvaluationType() === EvaluationType.COMPANY ? 'empresarial' : 'académica'
          } guardada exitosamente con nota: ${payload.score.toFixed(2)} / 5.0`,
        );
        this.loadData();
        setTimeout(() => this.successMessage.set(null), 6000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al registrar la evaluación');
      },
    });
  }

  openSummaryModal(internship: Internship): void {
    this.selectedInternship.set(internship);
    this.isLoading.set(true);
    this.evaluationService.getInternshipSummary(internship.id).subscribe({
      next: (res) => {
        this.activeSummary.set(res.data);
        this.showSummaryModal.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'No se pudo cargar el acta consolidada');
        this.isLoading.set(false);
      },
    });
  }

  closeSummaryModal(): void {
    this.showSummaryModal.set(false);
    this.activeSummary.set(null);
  }

  printSummary(): void {
    window.print();
  }
}
