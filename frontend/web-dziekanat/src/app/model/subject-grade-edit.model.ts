
export interface SubjectGradeEdit {
    subjectCode: string;
    subjectName: string;
    students: StudentSubjectGradeEdit[];
};

export interface StudentSubjectGradeEdit {
    studentName: string;
    studentSurname: string;
    studentIndexNumber: string;
    finalGrade: number;
};