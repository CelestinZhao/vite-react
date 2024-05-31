import { utils as XLSXUtils, writeFile } from 'xlsx';

export const download = (data = []) => {
  const header = ['UID', '干预容量'];
  const sheetData = [];
  sheetData.push(header);
  data.forEach((item = {}) => {
    sheetData.push([item.uid, item.quota]);
  });
  const wb = XLSXUtils.book_new();
  const sheet1 = XLSXUtils.json_to_sheet(sheetData, { skipHeader: true });
  XLSXUtils.book_append_sheet(wb, sheet1, 'sheet1');
  writeFile(wb, '白名单列表.xlsx');
};
