export const getHashSearchParam = (key, path) => {
	const url = path || location.href;
	const hash = url.substring(url.indexOf('#') + 1);
	const searchIndex = hash.indexOf('?');
	const search = searchIndex !== -1 ? hash.substring(searchIndex + 1) : '';
	const searchParams = new URLSearchParams(search);
	return searchParams.get(key);
};

export const getSearchParams = (key, path) => {
	const searchParams = new URLSearchParams(new URL(path || location.href).search);
	return searchParams.get(key);
};

export const getAllHashSearchParams = (path) => {
	const url = path || location.href;
	const hash = url.substring(url.indexOf('#') + 1);
	const searchIndex = hash.indexOf('?');
	const search = searchIndex !== -1 ? hash.substring(searchIndex + 1) : '';
	const searchParams = new URLSearchParams(search);
	return Object.fromEntries(searchParams.entries());
};

export const getAllSearchParams = (path) => {
	const searchParams = new URLSearchParams(new URL(path || location.href).search);
	return Object.fromEntries(searchParams.entries());
};
