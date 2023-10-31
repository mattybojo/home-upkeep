import { redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

export const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);
export const redirectLoggedInToDashboard = () => redirectLoggedInTo(['/']);
