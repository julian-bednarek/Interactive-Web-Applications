import { Address } from "./address.model";

export interface StudentPersonalView {
    firstName: string;
    lastName: string;
    fatherName: string | null;
    PESEL: string;
    placeOfBirth: string;
    phoneNumber: string;
    eDeliveryMail: string | null;
    address: Address
};