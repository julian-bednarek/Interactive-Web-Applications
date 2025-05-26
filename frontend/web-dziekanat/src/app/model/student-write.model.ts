import { Person } from "./person.model";

export interface StudentWrite extends Person {
    indexNumber: string;
    fieldOfStudy: number;
    semester: number;
    depositNumber: string;
};
