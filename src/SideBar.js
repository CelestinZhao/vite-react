import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'tdesign-react';
import {
	ViewListIcon,
	Edit1Icon,
	RootListIcon,
	CheckIcon,
	UserIcon,
	AppIcon,
} from 'tdesign-icons-react';

const { MenuGroup, MenuItem } = Menu;

function SideBar() {
	const [value, setValue] = useState('');
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();

	const onClick = ({ value }) => {
		navigate(`/${value}`, { state: { id: '主页' } });
	};

	useEffect(() => {
		const { pathname } = window.location;
		setValue(pathname.split('/')[1]);
	}, []);

	return (
		<Menu
			className="menu"
			value={value}
			onChange={(value) => setValue(value)}
			collapsed={collapsed}
			operations={
				<Button
					variant="text"
					shape="square"
					icon={<ViewListIcon />}
					onClick={() => setCollapsed(!collapsed)}
				/>
			}
		>
			<MenuGroup title="主导航">
				<MenuItem value="" icon={<AppIcon />} onClick={onClick}>
					主页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<MenuItem value="demo" icon={<Edit1Icon />} onClick={onClick}>
					demo项
				</MenuItem>
				<MenuItem value="dragDemo" icon={<RootListIcon />} onClick={onClick}>
					拖拽demo
				</MenuItem>
				<MenuItem value="dndKit" icon={<CheckIcon />} onClick={onClick}>
					dndKit
				</MenuItem>
				<MenuItem value="aiChat" icon={<UserIcon />} onClick={onClick}>
					AI 聊天
				</MenuItem>
				<MenuItem value="waterfall" icon={<UserIcon />} onClick={onClick}>
					瀑布流
				</MenuItem>
			</MenuGroup>
		</Menu>
	);
}

export default SideBar;
