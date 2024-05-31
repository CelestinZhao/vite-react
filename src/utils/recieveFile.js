const receiveFile = (data, fileName) => {
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }));
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', `${fileName}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default receiveFile;
