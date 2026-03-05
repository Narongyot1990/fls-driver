/**
 * Company Holidays (วันหยุดบริษัท)
 * Hardcoded list of company holidays for the current year.
 */

export interface ThaiHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  nameTh: string;
}

// Company holidays for 2026 (พ.ศ. 2569)
const COMPANY_HOLIDAYS: ThaiHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day", nameTh: 'วันขึ้นปีใหม่' },
  { date: '2026-01-02', name: 'New Year Special', nameTh: 'วันหยุดพิเศษ' },
  { date: '2026-03-03', name: 'Makha Bucha', nameTh: 'วันมาฆบูชา' },
  { date: '2026-04-13', name: 'Songkran', nameTh: 'วันสงกรานต์' },
  { date: '2026-04-14', name: 'Songkran', nameTh: 'วันสงกรานต์' },
  { date: '2026-04-15', name: 'Songkran', nameTh: 'วันสงกรานต์' },
  { date: '2026-05-01', name: 'Labor Day', nameTh: 'วันแรงงาน' },
  { date: '2026-05-04', name: 'Coronation Day', nameTh: 'วันฉัตรมงคล' },
  { date: '2026-06-03', name: "H.M. Queen Suthida's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษาพระราชินี' },
  { date: '2026-07-28', name: "H.M. King Vajiralongkorn's Birthday", nameTh: 'วันเฉลิมพระชนมพรรษา ร.10' },
  { date: '2026-07-29', name: 'Asalha Bucha', nameTh: 'วันอาสาฬหบูชา' },
  { date: '2026-08-12', name: "The Queen Mother's Birthday", nameTh: 'วันแม่แห่งชาติ' },
  { date: '2026-10-23', name: 'Chulalongkorn Day', nameTh: 'วันปิยมหาราช' },
  { date: '2026-12-05', name: "King Bhumibol's Birthday / Father's Day", nameTh: 'วันพ่อแห่งชาติ' },
  { date: '2026-12-07', name: "Father's Day observed", nameTh: 'วันหยุดชดเชยวันพ่อ' },
  { date: '2026-12-10', name: 'Constitution Day', nameTh: 'วันรัฐธรรมนูญ' },
  { date: '2026-12-31', name: "New Year's Eve", nameTh: 'วันสิ้นปี' },
];

/**
 * Get all company holidays for a given year
 */
export function getHolidaysForYear(year: number): ThaiHoliday[] {
  return COMPANY_HOLIDAYS.filter((h) => h.date.startsWith(`${year}-`));
}

/**
 * Get holidays for a specific month (0-indexed month like JS Date)
 */
export function getHolidaysForMonth(year: number, month: number): ThaiHoliday[] {
  const mm = String(month + 1).padStart(2, '0');
  return COMPANY_HOLIDAYS.filter((h) => h.date.startsWith(`${year}-${mm}-`));
}

/**
 * Check if a specific date string (YYYY-MM-DD) is a holiday
 */
export function isHoliday(dateStr: string): ThaiHoliday | undefined {
  return COMPANY_HOLIDAYS.find((h) => h.date === dateStr);
}

/**
 * Get holiday lookup map for a given year+month for fast O(1) lookup
 * Key is the day number (1-31)
 */
export function getHolidayMap(year: number, month: number): Map<number, ThaiHoliday> {
  const map = new Map<number, ThaiHoliday>();
  const monthHolidays = getHolidaysForMonth(year, month);
  for (const h of monthHolidays) {
    const day = parseInt(h.date.split('-')[2]);
    map.set(day, h);
  }
  return map;
}
