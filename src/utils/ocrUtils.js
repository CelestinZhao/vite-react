import { createWorker } from 'tesseract';
import { get } from 'lodash';

export const getOcr = async (url) => {
  const worker = await createWorker('chi_sim');
  const rsp = await worker.recognize(url);
  console.log('rsp----->', rsp);
  return get(rsp, 'data', {});
};
