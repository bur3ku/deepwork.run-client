import dayjs from 'dayjs'

export const getCurTime = (): dayjs.Dayjs => {
    return dayjs(new Date(new Date().toLocaleString("en-US", {timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone})));
  }
  
export const dayjsToStr = (day:dayjs.Dayjs): string => {
  return day.format("HH:mm MM/DD/YYYY").slice(0,5);
}

export const strToDayjs = (str:string): dayjs.Dayjs => {
  return dayjs(str+" 01/01/2020","HH:mm MM/DD/YYYY")
}