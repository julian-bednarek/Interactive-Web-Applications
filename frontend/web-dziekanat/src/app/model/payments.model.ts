import { FeeRead } from "./fee-read.model";
import { FieldOfStudyRead } from "./field-of-study-read.model";

export interface Payments {
    semester: number;
    fees: Array<FeeRead>;
    fieldOfStudy: FieldOfStudyRead;
};
