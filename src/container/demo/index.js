import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, message, Space, Upload } from 'tdesign-react';
// import { get } from 'lodash';
import { getOcr } from '../../utils/ocrUtils';
import styles from './demo.module.less';
import quotaModule from './quotaModule.xlsx';

const requestMethod = async (file) => {
	// const files = e.target.files || e.dataTransfer.files;
	await getOcr(file.raw);
	const formData = new FormData();
	formData.append('file[0]', file.raw);
	formData.append('length', 1);

	return ({
		status: 'success',
	});
};

function Demo() {
	const location = useLocation();
	const navigate = useNavigate();

	const onClick = () => {
		navigate('/', { state: { id: 'demo' } });
	};
	console.log(location.search);

	return (
		<Space direction="vertical">
			<Button className={styles.demo} onClick={onClick}>主页</Button>
			<a href={quotaModule} download={'新增模板.xlsx'}>模板下载</a>
			<Upload
				requestMethod={requestMethod}
				placeholder="图片orc识别"
				onSuccess={() => message.success('识别成功')}
				onFail={() => message.warning('识别失败')}
			/>
		</Space>
	);
}

export default Demo;
