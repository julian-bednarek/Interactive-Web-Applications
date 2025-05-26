import { FieldOfStudyRead } from "./field-of-study-read.model";

export interface GeneralStudyInfo {
    currentSemester: number;
    fieldOfStudy: FieldOfStudyRead;
    yearlyRegistration: string;
    averageGrade: number;
    averageSemesterGrade: number;
    ECTScolleted: number;
    ECTSrequired: number;
}
