
export enum View {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  TIMETABLE = 'TIMETABLE',
  CALENDAR = 'CALENDAR',
  TASKS = 'TASKS',
  GRADES = 'GRADES',
  GROUPS = 'GROUPS',
  SETTINGS = 'SETTINGS',
}

export interface Subject {
  id: string;
  name: string;
  attended: number; 
  absent: number;   
  total: number;    
}

export interface ClassSession {
  id: string;
  day: string; 
  subject: string;
  startTime: string;
  endTime: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  isHighPriority: boolean;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'EXAM' | 'BIRTHDAY' | 'HOLIDAY' | 'OTHER';
}

export interface GradeSubject {
  id: string;
  name: string;
  credits: number;
  grade: string; 
}

export interface Semester {
  id: string;
  name: string;
  subjects: GradeSubject[];
}

export interface Attachment {
  name: string;
  type: 'image' | 'video' | 'audio' | 'pdf' | 'doc' | 'docx' | 'other';
  url: string;
  size?: string;
}

export interface PollOption {
  id: string;
  text: string;
}

export interface PollData {
  question: string;
  options: PollOption[];
  votes: { [userId: string]: string }; // userId -> optionId
}

export interface Message {
  id: string;
  groupId: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: number; // Replaces timestamp
  type: 'text' | 'poll';
  isPinned: boolean;
  isMe: boolean;
  pollData?: PollData;
  attachment?: Attachment;
  isAI?: boolean;
}

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  members: string[]; // User IDs
  createdBy: string;
  createdAt: number;
  type: 'CLASS' | 'PROJECT' | 'SOCIAL';
  lastMessage?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK';
  url: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}
