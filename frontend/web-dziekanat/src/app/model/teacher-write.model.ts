import { Address } from "./address.model";
import { Person } from "./person.model";

export interface TeacherWrite extends Person {
    academicTitle: string;
};