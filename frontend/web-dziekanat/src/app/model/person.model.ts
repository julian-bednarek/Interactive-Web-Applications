import { Address } from "./address.model";

export interface Person {
    firstName: string;
    lastName: string;
    fatherName: string | null;
    pesel: string;
    eDeliveryMail: string | null;
    facultyId: number;
    placeOfBirth: string;
    phoneNumber: string;
    auth0Id: string;
    id: number | null;
    address: Address;
};