export interface SubjectWrite {
    code: string; // code is ID
    name: string;
    ects: number;
    teacherId: number;
    teacherName?: string; // Optional: Added for display purposes in manage component
};
