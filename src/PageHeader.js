import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'tdesign-react';
import { HomeIcon } from 'tdesign-icons-react';

function PageHeader() {
	const navigate = useNavigate();

	return (
		<Layout.Header className="site-layout-header">
			<div className="left-area">
				<img src="https://tdesign.gtimg.com/site/baseLogo-light.png" height="28" alt="logo"/>
				<HomeIcon size={20} onClick={() => navigate('/')}/>
			</div>
		</Layout.Header>
	);
}

export default PageHeader;
