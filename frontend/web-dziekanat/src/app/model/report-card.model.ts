import { SubjectRead } from "./subject-read.model";

export interface ReportCardView {
    subjects: Array<SubjectRead>;
    ECTScolleted: number;
    ECTSsum: number;
    average: number;
    semester: number;
};