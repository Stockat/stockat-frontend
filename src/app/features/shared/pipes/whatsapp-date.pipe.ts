import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'whatsappDate', standalone: true })
export class WhatsappDatePipe implements PipeTransform {
  transform(value: string | Date | undefined | null, alwaysShowTime: boolean = false): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return time;
    if (isYesterday) return alwaysShowTime ? `Yesterday, ${time}` : 'Yesterday';
    // Older: show date (e.g. 4/21/2024) or date + time if alwaysShowTime
    const dateStr = date.toLocaleDateString();
    return alwaysShowTime ? `${dateStr}, ${time}` : dateStr;
  }
} 