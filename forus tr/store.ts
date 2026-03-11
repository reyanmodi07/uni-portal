
import React, { useState, useEffect } from 'react';
import { Subject, ClassSession, Task, Semester, Message, CalendarEvent, Group } from './types';

const INITIAL_SUBJECTS: Subject[] = [];

const INITIAL_TIMETABLE: ClassSession[] = [];

const INITIAL_TASKS: Task[] = [];

const INITIAL_EVENTS: CalendarEvent[] = [];

const INITIAL_SEMESTERS: Semester[] = [];

const INITIAL_GROUPS: Group[] = [];

const INITIAL_MESSAGES: Message[] = [];

const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

export const useStore = () => {
  const [userName, setUserName] = useStickyState<string>('portal_username', 'Student');
  const [university, setUniversity] = useStickyState<string>('portal_university', 'Ahmedabad University');
  const [course, setCourse] = useStickyState<string>('portal_course', 'Computer Science');
  
  const [subjects, setSubjects] = useStickyState<Subject[]>('portal_subjects', INITIAL_SUBJECTS);
  const [timetable, setTimetable] = useStickyState<ClassSession[]>('portal_timetable', INITIAL_TIMETABLE);
  const [tasks, setTasks] = useStickyState<Task[]>('portal_tasks', INITIAL_TASKS);
  const [events, setEvents] = useStickyState<CalendarEvent[]>('portal_events', INITIAL_EVENTS);
  const [semesters, setSemesters] = useStickyState<Semester[]>('portal_semesters', INITIAL_SEMESTERS);
  
  const [groups, setGroups] = useStickyState<Group[]>('portal_groups', INITIAL_GROUPS);
  const [messages, setMessages] = useStickyState<Message[]>('portal_messages', INITIAL_MESSAGES);

  return {
    userName, setUserName,
    university, setUniversity,
    course, setCourse,
    subjects, setSubjects,
    timetable, setTimetable,
    tasks, setTasks,
    events, setEvents,
    semesters, setSemesters,
    groups, setGroups,
    messages, setMessages
  };
};
