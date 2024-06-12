import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Space } from 'tdesign-react';
import { get } from 'lodash';
import axios from 'axios';
import { getOcr } from '../../utils/ocrUtils';
import styles from './demo.module.less';
import quotaModule from './quotaModule.xlsx';

export const onFileChange = async (e) => {
	const files = e.target.files || e.dataTransfer.files;
	await getOcr(files[0]);
	// 通过FormData将文件转成二进制数据
	const formData = new FormData();
	// 将文件转二进制
	for (let i = 0; i < files.length; i++) {
		formData.append(`file[${i}]`, files[i]);
	}
	formData.append('length', String(files.length));

	await axios.post('/api/v1/proxy/manualQuotaUpload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
};

function Demo() {
	// const location = useLocation();
	const navigate = useNavigate();

	const onClick = () => {
		navigate('/', { state: { id: 'demo' } });
	}

	return (
		<Space direction="vertical">
			<Button className={styles.demo} onClick={onClick}>主页</Button>
			<a href={quotaModule} download={'新增模板.xlsx'}>模板下载</a>
			<input type="file" accept="image/*" onChange={onFileChange}/>
		</Space>
	);
}

export default Demo;
