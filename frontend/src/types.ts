export type Role = 'admin' | 'user';

/** Shape the layout chrome (Sidebar/Topbar) needs — a view of the authenticated user, not the API's. */
export interface DisplayUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  initials: string;
}
