export enum Role {
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  STUDENT = 'STUDENT',
  COMPANY = 'COMPANY',
  TUTOR = 'TUTOR',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone?: string;
  role: Role;
  isActive?: boolean;
}
