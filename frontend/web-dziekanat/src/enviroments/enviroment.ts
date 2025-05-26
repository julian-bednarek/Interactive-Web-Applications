import { domain, clientId, audience, scope } from '../../auth0config.json';

export const environment = {
    production: false,
    auth0: {
        domain,
        clientId,
        audience,
        scope
    }
};