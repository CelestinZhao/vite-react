import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message, Space, Textarea, Upload } from 'tdesign-react';
import { getOcr } from '../../utils/ocrUtils';
import styles from './demo.module.less';
import quotaModule from './quotaModule.xlsx';

function Demo() {
	const [value, setValue] = useState('');
	const location = useLocation();
	const navigate = useNavigate();

	const requestMethod = async (file) => {
		// const files = e.target.files || e.dataTransfer.files;
		const { text = '' } = await getOcr(file.raw);
		setValue(text);
		const formData = new FormData();
		formData.append('file[0]', file.raw);
		formData.append('length', 1);

		return ({
			status: 'success',
		});
	};

	const onClick = () => {
		navigate('/', { state: { id: 'demo' } });
	};
	console.log(location.search);

	return (
		<Space direction="vertical" style={{ width: '100%' }}>
			<Button className={styles.demo} onClick={onClick}>主页</Button>
			<a href={quotaModule} download={'新增模板.xlsx'}>模板下载</a>
			<Upload
				requestMethod={requestMethod}
				placeholder="图片orc识别"
				onSuccess={() => message.success('识别成功')}
				onFail={() => message.warning('识别失败')}
			/>
			<Textarea value={value} onChange={setValue} autosize={{ minRows: 10, maxRows: 15 }}/>
		</Space>
	);
}

export default Demo;
