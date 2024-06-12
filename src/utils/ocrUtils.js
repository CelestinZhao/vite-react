import { createWorker } from 'tesseract';

export const getOcr = async (url) => {
  const worker = await createWorker('chi_sim');
  const rsp = await worker.recognize(url);
  console.log('rsp----->', rsp);
};
