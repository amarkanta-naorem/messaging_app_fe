export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  joinedAt: string | Date
}

export interface Group {
  id: string | number;
  name: string;
  avatar: string | null;
}

export interface ContactDetails extends Employee {
  groups?: Group[];
}

export const formatDate = (date: string | Date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).replace(/ (\d{4})$/, ', $1');
};