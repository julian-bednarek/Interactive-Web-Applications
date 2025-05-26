import { Roles } from "./enum/roles.enum";

export interface Auth0 {
    user_id: string;
    role: Roles;
};