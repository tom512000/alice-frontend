import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import patientsReducer from '@/features/patients/patientsSlice';
import usersReducer from '@/features/users/usersSlice';
import appointmentsReducer from '@/features/appointments/appointmentsSlice';
import consultationsReducer from '@/features/consultations/consultationsSlice';
import staysReducer from '@/features/stays/staysSlice';
import observationsReducer from '@/features/observations/observationsSlice';
import vitalSignsReducer from '@/features/vitalSigns/vitalSignsSlice';
import medicalExamsReducer from '@/features/medicalExams/medicalExamsSlice';
import medicalHistoriesReducer from '@/features/medicalHistories/medicalHistoriesSlice';
import diagnosesReducer from '@/features/diagnoses/diagnosesSlice';
import prescriptionsReducer from '@/features/prescriptions/prescriptionsSlice';
import treatmentsReducer from '@/features/treatments/treatmentsSlice';
import medicinesReducer from '@/features/medicines/medicinesSlice';
import pathologiesReducer from '@/features/pathologies/pathologiesSlice';
import allergiesReducer from '@/features/allergies/allergiesSlice';
import servicesReducer from '@/features/services/servicesSlice';
import specialtiesReducer from '@/features/specialties/specialtiesSlice';
import holidaysReducer from '@/features/holidays/holidaysSlice';
import surgicalOperationsReducer from '@/features/surgicalOperations/surgicalOperationsSlice';
import treatPeopleReducer from '@/features/treatPeople/treatPeopleSlice';
import takesReducer from '@/features/takes/takesSlice';
import commentsReducer from '@/features/comments/commentsSlice';
import documentsReducer from '@/features/documents/documentsSlice';
import auditReducer from '@/features/audit/auditSlice';
import icd10Reducer from '@/features/icd10/icd10Slice';
import consentsReducer from '@/features/consents/consentsSlice';
import roomsReducer from '@/features/rooms/roomsSlice';
import bedsReducer from '@/features/rooms/bedsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    users: usersReducer,
    appointments: appointmentsReducer,
    consultations: consultationsReducer,
    stays: staysReducer,
    observations: observationsReducer,
    vitalSigns: vitalSignsReducer,
    medicalExams: medicalExamsReducer,
    medicalHistories: medicalHistoriesReducer,
    diagnoses: diagnosesReducer,
    prescriptions: prescriptionsReducer,
    treatments: treatmentsReducer,
    medicines: medicinesReducer,
    pathologies: pathologiesReducer,
    allergies: allergiesReducer,
    services: servicesReducer,
    specialties: specialtiesReducer,
    holidays: holidaysReducer,
    surgicalOperations: surgicalOperationsReducer,
    treatPeople: treatPeopleReducer,
    takes: takesReducer,
    comments: commentsReducer,
    documents: documentsReducer,
    audit: auditReducer,
    icd10: icd10Reducer,
    consents: consentsReducer,
    rooms: roomsReducer,
    beds: bedsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
