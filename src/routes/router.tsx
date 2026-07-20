import { createBrowserRouter } from 'react-router-dom';
import { PrivateRoute, AdminRoute } from '@/components/guards/PrivateRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { NotFound } from '@/pages/NotFound';
import { Forbidden } from '@/pages/Forbidden';

// Patients
import { PatientListPage } from '@/features/patients/pages/PatientListPage';
import { PatientFormPage } from '@/features/patients/pages/PatientFormPage';
import { PatientDetailPage } from '@/features/patients/pages/PatientDetailPage';

// Appointments
import { AppointmentListPage } from '@/features/appointments/pages/AppointmentListPage';
import { AppointmentFormPage } from '@/features/appointments/pages/AppointmentFormPage';

// Consultations
import { ConsultationListPage } from '@/features/consultations/pages/ConsultationListPage';
import { ConsultationFormPage } from '@/features/consultations/pages/ConsultationFormPage';
import { ConsultationDetailPage } from '@/features/consultations/pages/ConsultationDetailPage';

// Stays
import { StayListPage } from '@/features/stays/pages/StayListPage';
import { StayFormPage } from '@/features/stays/pages/StayFormPage';
import { StayDetailPage } from '@/features/stays/pages/StayDetailPage';

// Observations
import { ObservationListPage } from '@/features/observations/pages/ObservationListPage';
import { ObservationFormPage } from '@/features/observations/pages/ObservationFormPage';

// Vital Signs
import { VitalSignListPage } from '@/features/vitalSigns/pages/VitalSignListPage';
import { VitalSignFormPage } from '@/features/vitalSigns/pages/VitalSignFormPage';

// Diagnoses
import { DiagnosisListPage } from '@/features/diagnoses/pages/DiagnosisListPage';
import { DiagnosisFormPage } from '@/features/diagnoses/pages/DiagnosisFormPage';

// Medical Exams
import { MedicalExamListPage } from '@/features/medicalExams/pages/MedicalExamListPage';
import { MedicalExamFormPage } from '@/features/medicalExams/pages/MedicalExamFormPage';
import { MedicalExamDetailPage } from '@/features/medicalExams/pages/MedicalExamDetailPage';

// Prescriptions
import { PrescriptionListPage } from '@/features/prescriptions/pages/PrescriptionListPage';
import { PrescriptionFormPage } from '@/features/prescriptions/pages/PrescriptionFormPage';
import { PrescriptionDetailPage } from '@/features/prescriptions/pages/PrescriptionDetailPage';

// Surgical Operations
import { SurgicalOperationListPage } from '@/features/surgicalOperations/pages/SurgicalOperationListPage';
import { SurgicalOperationFormPage } from '@/features/surgicalOperations/pages/SurgicalOperationFormPage';
import { SurgicalOperationDetailPage } from '@/features/surgicalOperations/pages/SurgicalOperationDetailPage';

// Medical Histories
import { MedicalHistoryListPage } from '@/features/medicalHistories/pages/MedicalHistoryListPage';
import { MedicalHistoryFormPage } from '@/features/medicalHistories/pages/MedicalHistoryFormPage';

// Treatments
import { TreatmentListPage } from '@/features/treatments/pages/TreatmentListPage';
import { TreatmentFormPage } from '@/features/treatments/pages/TreatmentFormPage';

// Takes
import { TakeListPage } from '@/features/takes/pages/TakeListPage';
import { TakeFormPage } from '@/features/takes/pages/TakeFormPage';

// Comments
import { CommentListPage } from '@/features/comments/pages/CommentListPage';
import { CommentFormPage } from '@/features/comments/pages/CommentFormPage';

// Documents
import { DocumentListPage } from '@/features/documents/pages/DocumentListPage';
import { DocumentFormPage } from '@/features/documents/pages/DocumentFormPage';

// Consents (RGPD)
import { ConsentListPage } from '@/features/consents/pages/ConsentListPage';
import { ConsentFormPage } from '@/features/consents/pages/ConsentFormPage';

// Security (2FA)
import { SecuritySettingsPage } from '@/features/security/pages/SecuritySettingsPage';

// Rooms & beds (plan visuel)
import { BedBoardPage } from '@/features/rooms/pages/BedBoardPage';
import { RoomPlanEditorPage } from '@/features/rooms/pages/RoomPlanEditorPage';

// Audit log (admin)
import { AuditLogListPage } from '@/features/audit/pages/AuditLogListPage';

// Admin / Users
import { UserListPage } from '@/features/users/pages/UserListPage';
import { UserFormPage } from '@/features/users/pages/UserFormPage';

// Admin / Reference data
import { ServicesPage } from '@/features/admin/pages/ServicesPage';
import { SpecialtiesPage } from '@/features/admin/pages/SpecialtiesPage';
import { MedicinesPage } from '@/features/admin/pages/MedicinesPage';
import { PathologiesPage } from '@/features/admin/pages/PathologiesPage';
import { AllergiesPage } from '@/features/admin/pages/AllergiesPage';
import { HolidaysPage } from '@/features/admin/pages/HolidaysPage';
import { TreatPeoplePage } from '@/features/admin/pages/TreatPeoplePage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/forbidden', element: <Forbidden /> },

      // Patients
      { path: '/patients', element: <PatientListPage /> },
      { path: '/patients/new', element: <PatientFormPage /> },
      { path: '/patients/:id', element: <PatientDetailPage /> },
      { path: '/patients/:id/edit', element: <PatientFormPage /> },

      // Appointments
      { path: '/appointments', element: <AppointmentListPage /> },
      { path: '/appointments/new', element: <AppointmentFormPage /> },
      { path: '/appointments/:id/edit', element: <AppointmentFormPage /> },

      // Consultations
      { path: '/consultations', element: <ConsultationListPage /> },
      { path: '/consultations/new', element: <ConsultationFormPage /> },
      { path: '/consultations/:id', element: <ConsultationDetailPage /> },
      { path: '/consultations/:id/edit', element: <ConsultationFormPage /> },

      // Stays
      { path: '/stays', element: <StayListPage /> },
      { path: '/stays/new', element: <StayFormPage /> },
      { path: '/stays/:id', element: <StayDetailPage /> },
      { path: '/stays/:id/edit', element: <StayFormPage /> },

      // Chambres & lits (plan visuel)
      { path: '/beds', element: <BedBoardPage /> },

      // Observations
      { path: '/observations', element: <ObservationListPage /> },
      { path: '/observations/new', element: <ObservationFormPage /> },
      { path: '/observations/:id/edit', element: <ObservationFormPage /> },

      // Vital Signs
      { path: '/vital-signs', element: <VitalSignListPage /> },
      { path: '/vital-signs/new', element: <VitalSignFormPage /> },
      { path: '/vital-signs/:id/edit', element: <VitalSignFormPage /> },

      // Diagnoses
      { path: '/diagnoses', element: <DiagnosisListPage /> },
      { path: '/diagnoses/new', element: <DiagnosisFormPage /> },
      { path: '/diagnoses/:id/edit', element: <DiagnosisFormPage /> },

      // Medical Exams
      { path: '/medical-exams', element: <MedicalExamListPage /> },
      { path: '/medical-exams/new', element: <MedicalExamFormPage /> },
      { path: '/medical-exams/:id', element: <MedicalExamDetailPage /> },
      { path: '/medical-exams/:id/edit', element: <MedicalExamFormPage /> },

      // Prescriptions
      { path: '/prescriptions', element: <PrescriptionListPage /> },
      { path: '/prescriptions/new', element: <PrescriptionFormPage /> },
      { path: '/prescriptions/:id', element: <PrescriptionDetailPage /> },
      { path: '/prescriptions/:id/edit', element: <PrescriptionFormPage /> },

      // Surgical Operations
      { path: '/surgical-operations', element: <SurgicalOperationListPage /> },
      { path: '/surgical-operations/new', element: <SurgicalOperationFormPage /> },
      { path: '/surgical-operations/:id', element: <SurgicalOperationDetailPage /> },
      { path: '/surgical-operations/:id/edit', element: <SurgicalOperationFormPage /> },

      // Medical Histories
      { path: '/medical-histories', element: <MedicalHistoryListPage /> },
      { path: '/medical-histories/new', element: <MedicalHistoryFormPage /> },
      { path: '/medical-histories/:id/edit', element: <MedicalHistoryFormPage /> },

      // Treatments
      { path: '/treatments', element: <TreatmentListPage /> },
      { path: '/treatments/new', element: <TreatmentFormPage /> },
      { path: '/treatments/:id/edit', element: <TreatmentFormPage /> },

      // Takes
      { path: '/takes', element: <TakeListPage /> },
      { path: '/takes/new', element: <TakeFormPage /> },
      { path: '/takes/:id/edit', element: <TakeFormPage /> },

      // Comments
      { path: '/comments', element: <CommentListPage /> },
      { path: '/comments/new', element: <CommentFormPage /> },
      { path: '/comments/:id/edit', element: <CommentFormPage /> },

      // Documents
      { path: '/documents', element: <DocumentListPage /> },
      { path: '/documents/new', element: <DocumentFormPage /> },
      { path: '/documents/:id/edit', element: <DocumentFormPage /> },

      // Consents (RGPD)
      { path: '/consents', element: <ConsentListPage /> },
      { path: '/consents/new', element: <ConsentFormPage /> },
      { path: '/consents/:id/edit', element: <ConsentFormPage /> },

      // Sécurité du compte (2FA)
      { path: '/settings/security', element: <SecuritySettingsPage /> },

      // Admin
      {
        element: <AdminRoute />,
        children: [
          { path: '/admin/users', element: <UserListPage /> },
          { path: '/admin/users/new', element: <UserFormPage /> },
          { path: '/admin/users/:id/edit', element: <UserFormPage /> },
          { path: '/admin/audit', element: <AuditLogListPage /> },
          { path: '/admin/room-plan', element: <RoomPlanEditorPage /> },
          { path: '/admin/services', element: <ServicesPage /> },
          { path: '/admin/specialties', element: <SpecialtiesPage /> },
          { path: '/admin/medicines', element: <MedicinesPage /> },
          { path: '/admin/pathologies', element: <PathologiesPage /> },
          { path: '/admin/allergies', element: <AllergiesPage /> },
          { path: '/admin/holidays', element: <HolidaysPage /> },
          { path: '/admin/treat-people', element: <TreatPeoplePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
