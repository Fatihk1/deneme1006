// Yardımcı fonksiyonlar (utils)

export function addYears(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function getDaysLeft(date) {
  if (!date) return null;
  const today = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

export function addMonths(date, months) {
  if (!date) return '';
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  return d.toISOString().slice(0, 10);
}

export function getFireEquipmentDaysLeft(lastCheckDate) {
  if (!lastCheckDate) return null;
  const today = new Date();
  const nextCheck = new Date(lastCheckDate);
  nextCheck.setFullYear(nextCheck.getFullYear() + 1);
  const diff = Math.ceil((nextCheck - today) / (1000 * 60 * 60 * 24));
  return diff;
} 