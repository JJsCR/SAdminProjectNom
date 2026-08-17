export interface UserAvatarItem {
  publicUrl?: string;
  [key: string]: unknown;
}

export class Users {
  id: string;

  name: string;

  lastName: string;

  phoneNumber: string;

  username: string;

  role: string;

  disabled: boolean;

  password: string;

  emailVerified: boolean;

  emailVerificationToken: string;

  emailVerificationTokenExpiresAt: Date | null;

  passwordResetToken: string;

  passwordResetTokenExpiresAt: Date | null;

  provider: string;

  avatar: UserAvatarItem[];

  createdBy: Users | null;
  updatedBy: Users | null;
}

export interface UsersList {
  count: number;
  rows: Users[];
}
