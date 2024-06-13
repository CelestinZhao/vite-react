import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menu } from 'tdesign-react';
import {
	ViewListIcon,
	ServerIcon,
	Edit1Icon,
	RootListIcon,
	CheckIcon,
	UserIcon,
	AppIcon,
	LoginIcon,
} from 'tdesign-icons-react';

const { MenuGroup, MenuItem, SubMenu } = Menu;

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
				<Button variant="text" shape="square" icon={<ViewListIcon />} onClick={() => setCollapsed(!collapsed)} />
			}
		>
			<MenuGroup title="主导航">
				<MenuItem value="" icon={<AppIcon/>} onClick={onClick}>
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
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="主导航">
				<MenuItem value="item1" icon={<AppIcon />}>
					仪表盘
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="组件">
				<SubMenu title="列表项" value="2-1" icon={<ServerIcon />}>
					<MenuItem value="2-1-1">基础列表项</MenuItem>
					<MenuItem value="2-1-2">卡片列表项</MenuItem>
					<MenuItem value="2-1-3">筛选列表项</MenuItem>
					<MenuItem value="2-1-4">树状筛选列表项</MenuItem>
				</SubMenu>
				<MenuItem value="2-2" icon={<Edit1Icon />}>
					表单项
				</MenuItem>
				<MenuItem value="2-3" icon={<RootListIcon />}>
					详情页
				</MenuItem>
				<MenuItem value="2-4" icon={<CheckIcon />}>
					结果页
				</MenuItem>
			</MenuGroup>
			<MenuGroup title="更多">
				<MenuItem value="item3" icon={<UserIcon />}>
					个人页
				</MenuItem>
				<MenuItem value="item4" icon={<LoginIcon />}>
					登录页
				</MenuItem>
			</MenuGroup>
		</Menu>
	);
}

export default SideBar;
