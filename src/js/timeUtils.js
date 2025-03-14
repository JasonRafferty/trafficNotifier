// timeUtils.js
export function parseTimeString(timeStr) {
    const [hh, mm] = timeStr.split(":");
    return parseInt(hh) * 60 + parseInt(mm);
  }