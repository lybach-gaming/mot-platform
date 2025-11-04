export enum EUserType {
  Gmail = 'gmail',
  Email = 'email',
  Mobile = 'mobile',
  Apple = 'apple',
}

export enum EUserStatus {
  Inactive = 0,
  Active = 1,
}

export enum EUserVerifyStatus {
  Inactive = 0,
  Active = 1,
}

export interface IUser {
  id: number;
  firebase_id: string;
  name: string;
  email: string;
  mobile: string;
  type: EUserType;
  profile: string | null;
  fcm_id: string | null;
  coins: number;
  refer_code: string;
  friends_code: string;
  remove_ads: boolean;
  status: EUserStatus;
  date_registered: string;
  api_token: string;
  is_credited: boolean;
  is_verify: EUserVerifyStatus;
  newsletter_opt_in: boolean | null;
  locale?: string;
  timezone?: string;
}
