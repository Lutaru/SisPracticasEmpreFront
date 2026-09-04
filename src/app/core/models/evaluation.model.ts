export enum EvaluationType {
  COMPANY = 'COMPANY',
  TUTOR = 'TUTOR',
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weightPercent: number;
}

export const COMPANY_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'technicalCompetence',
    name: 'Competencia Técnica y Calidad',
    description: 'Aplicación de conocimientos profesionales y calidad en los entregables del puesto.',
    weightPercent: 25,
  },
  {
    id: 'problemSolving',
    name: 'Resolución de Problemas e Iniciativa',
    description: 'Capacidad de proponer soluciones eficaces y autonomía responsable.',
    weightPercent: 25,
  },
  {
    id: 'teamwork',
    name: 'Trabajo en Equipo y Comunicación',
    description: 'Relación interpersonal armónica, asertividad y articulación con sus compañeros.',
    weightPercent: 25,
  },
  {
    id: 'responsibility',
    name: 'Responsabilidad y Compromiso',
    description: 'Puntualidad, asistencia y estricto cumplimiento de políticas y deberes asignados.',
    weightPercent: 25,
  },
];

export const TUTOR_RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'workPlanCompliance',
    name: 'Cumplimiento del Plan de Trabajo',
    description: 'Avance sistemático y coherente respecto a las metas acordadas al inicio.',
    weightPercent: 25,
  },
  {
    id: 'reportsQuality',
    name: 'Calidad de Informes de Avance',
    description: 'Rigor técnico, metodología adecuada y claridad expositiva en los reportes.',
    weightPercent: 25,
  },
  {
    id: 'timelyDelivery',
    name: 'Puntualidad en Entregas y Asesorías',
    description: 'Presentación oportuna de evidencias y participación en sesiones de tutoría.',
    weightPercent: 25,
  },
  {
    id: 'finalReportDefense',
    name: 'Sustentación e Informe Final',
    description: 'Profundidad de resultados, lecciones aprendidas e impacto de la práctica.',
    weightPercent: 25,
  },
];

export interface Evaluation {
  id: string;
  internshipId: string;
  internship?: any;
  evaluatorId: string;
  evaluator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  evaluatorType: EvaluationType;
  score: number;
  criteriaScores: Record<string, number>;
  strengths?: string | null;
  improvements?: string | null;
  recommendations?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationSummary {
  internship: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    weeklyHours: number;
    finalGrade: number | null;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      documentNumber: string;
    };
    company: {
      id: string;
      legalName: string;
      supervisorName?: string;
      supervisorEmail?: string;
    };
    tutor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  companyEvaluation: Evaluation | null;
  tutorEvaluation: Evaluation | null;
  finalGrade: number | null;
  isComplete: boolean;
  passingGrade: number;
  passed: boolean | null;
}

export interface CreateEvaluationPayload {
  internshipId: string;
  evaluatorType: EvaluationType;
  score: number;
  criteriaScores: Record<string, number>;
  strengths?: string;
  improvements?: string;
  recommendations?: string;
}
