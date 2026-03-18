---
title: Astro 集成 ech0 实现朋友圈
published: 2026-03-18
description: 'Astro + Ech0 实现 朋友圈动态 功能'
image: 'https://img.meituan.net/content/76ce3481bf9a82056df39e03c54d6ba117154003.png'
tags: ['Ech0', 'Astro']
category: 'Astro'
draft: false 
---




## Docker部署Ech0

```bash
# 先拉取镜像
docker pull hub.rat.dev/sn0wl1n/ech0:latest

# 创建挂载目录
mkdir -p /home/docker/ech0/data/backup
mkdir -p /home/docker/ech0/data/ech0-data
```

```bash
# 创建docker-compose，在ech0目录下
[root@iZbp143l1lire02d1p2giaZ ech0]# cat docker-compose.yml 
services:
  ech0:
    image: sn0wl1n/ech0:latest
    container_name: ech0-service
    environment:
      - JWT_SECRET=xxxx  # 随便写一个长字符串，用于登录加密
    ports:
      - "6277:6277" # 保持内部 6277 端口映射到宿主机的 6277
    volumes:
      - ./data/ech0-data:/app/data
      - ./data/backup:/app/backup
    restart: always
```
将以上内容写入任意文件内，命名为docker-compose.yml，在当前目录下执行：

```bash
docker compose up -d
```

## 准备服务器

**在域名解析中配置我们的二级域名**

添加一个新的记录 记录类型为‘A’ ,主机记录就是我们的二级域名，记录值为我们的服务器IP；


**放行端口号**

在云服务器的安全组，放行我们刚刚`docker-compose`中写的端口号：6277


**修改nginx文件**

```txt
# 1. 处理 ech0.zzyang.top 的 HTTP 请求，强制跳转 HTTPS
server {
    listen 80;
    server_name ech0.zzyang.top;
    return 301 https://ech0.zzyang.top$request_uri;
}

# 2. 处理 ech0.zzyang.top 的 HTTPS 请求
server {
    listen 443 ssl;
    server_name ech0.zzyang.top;

    # 使用你现有的证书（如果是泛域名证书可以直接用，如果不是，请确保该证书包含 ech0 域名）
    ssl_certificate /etc/nginx/ssl/zzyang.top.pem;
    ssl_certificate_key /etc/nginx/ssl/zzyang.top.key;

    # 复用你已有的安全设置
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # 反向代理到 ech0 容器
    location / {
        proxy_pass http://你的IP:6277; 
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 必须：支持 Websocket，否则 ech0 无法实时同步
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```


## 修改Astro代码

**添加新的样式代码**

```css title="public/css/ech0-talk.css"
:root {
    --liushen-card-bg: #fff;
    --liushen-card-border: 1px solid #e3e8f7;
    --card-box-shadow: 0 3px 8px 6px rgba(7,17,27,0.09);
    --card-hover-box-shadow: 0 3px 8px 6px rgba(7,17,27,0.2);
    --liushen-card-secondbg: #f1f3f8;
    --liushen-button-hover-bg: #2679cc;
    --liushen-text: #4c4948;
    --liushen-button-bg: #f1f3f8;
    --liushen-fancybox-bg: rgba(255,255,255,0.5);
}

:root.dark, .dark {
    --liushen-card-bg: #181818;
    --liushen-card-secondbg: #30343f;
    --liushen-card-border: 1px solid #42444a;
    --card-box-shadow: 0 3px 8px 6px rgba(7,17,27,0.09);
    --card-hover-box-shadow: 0 3px 8px 6px rgba(7,17,27,0.2);
    --liushen-button-bg: #30343f;
    --liushen-button-hover-bg: #2679cc;
    --liushen-text: rgba(255,255,255,0.702);
    --liushen-fancybox-bg: rgba(0,0,0,0.5);
}

#talk .talk_item {
    width: 100%;
    background: var(--liushen-card-bg);
    border: var(--liushen-card-border);
    box-shadow: var(--card-box-shadow);
    transition: box-shadow .3s ease-in-out;
    border-radius: 12px;
    display: inline-block;
    flex-direction: column;
    padding: 20px;
    margin: 0 0 16px;
    color: var(--liushen-text);
    break-inside: avoid;
}
#talk .talk_item:hover {
    box-shadow: var(--card-hover-box-shadow);
}

#talk{
    position: relative;
    width: 100%;
    box-sizing: border-box;
    column-count: 2;
    column-gap: 16px;
}

@media (max-width: 900px) {
    #talk {
      column-count: 1;
      column-gap: 0;
    }
}

#talk .talk_meta .avatar {
    margin: 0 !important;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    flex-shrink: 0;
}
#talk .talk_bottom,
#talk .talk_meta {
    display: flex;
    align-items: center;
}
#talk .talk_meta {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(128,128,128,0.6);
}
#talk .talk_bottom {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed grey;
    justify-content: space-between;
}
#talk .talk_meta .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1 1 auto;
}
#talk .talk_meta .info .talk_nick {
    color: #6dbdc3;
    font-size: 1.2rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1.2;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#talk .talk_meta .info svg.is-badge.icon {
    width: 15px;
    display: inline-block;
    vertical-align: middle;
}
#talk .talk_meta .info span.talk_date {
    opacity: .6;
    font-size: 0.85rem;
}
#talk .talk_item .talk_content {
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.65;
}
#talk .talk_item .talk_content .zone_imgbox {
    display: flex;
    flex-wrap: wrap;
    --w: calc(25% - 8px);
    gap: 10px;
    margin-top: 10px;
}
#talk .talk_item .talk_content .zone_imgbox a {
    display: block;
    border-radius: 12px;
    width: var(--w);
    aspect-ratio: 1/1;
    position: relative;
}
#talk .talk_item .talk_content .zone_imgbox a:first-child {
    width: 100%;
    aspect-ratio: 1.8;
}
#talk .talk_item .talk_content .zone_imgbox img {
    border-radius: 10px;
    width: 100%;
    height: 100%;
    margin: 0 !important;
    object-fit: cover;
}
#talk .talk_item .talk_bottom {
    opacity: .9;
}
#talk .talk_item .talk_bottom .icon {
    float: right;
    transition: all .3s;
}
#talk .talk_item .talk_bottom .icon:hover {
    color: #49b1f5;
}
#talk .talk_item .talk_bottom span.talk_tag,
#talk .talk_item .talk_bottom span.location_tag {
    font-size: 0.85rem;
    background-color: var(--liushen-card-secondbg);
    border-radius: 12px;
    padding: 3px 15px 3px 10px;
    transition: box-shadow 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#talk .talk_item .talk_bottom span.location_tag {
    margin-left: 5px;
}

#talk .talk_item .talk_bottom span.talk_tag:hover,
#talk .talk_item .talk_bottom span.location_tag:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
#talk .talk_item .talk_content>a {
    margin: 0 3px;
    color: #ff7d73 !important;
}
#talk .talk_item .talk_content>a:hover{
    text-decoration: none !important;
    color: #ff5143 !important
}

@media screen and (max-width: 900px) {
    #talk .talk_item .talk_content .zone_imgbox {
        --w: calc(33% - 5px);
    }
    #talk .talk_item #post-comment{
        margin: 0 3px
    }
}
@media screen and (max-width: 768px) {
    .zone_imgbox {
        gap: 6px;
    }
    .zone_imgbox {
        --w: calc(50% - 3px);
    }
    span.talk_date {
        font-size: 14px;
    }
}

#talk .talk_item .talk_content .douban-card {
    margin-top: 10px !important;
    text-decoration: none;
    align-items: center;
    border-radius: 12px;
    color: #faebd7;
    display: flex;
    justify-content: center;
    margin: 10px;
    max-width: 400px;
    overflow: hidden;
    padding: 15px;
    position: relative;
}

#talk .talk_item .talk_content .shuoshuo-external-link {
    width: 100%;
    height: 80px;
    margin-top: 10px;
    border-radius: 12px;
    background-color: var(--liushen-card-secondbg);
    color: var(--liushen-text);
    border: var(--liushen-card-border);
    transition: background-color .3s ease-in-out;
}

.shuoshuo-external-link:hover {
    background-color: var(--liushen-button-hover-bg);
}

.shuoshuo-external-link .external-link {
    display: flex;
    color: var(--liushen-text) !important;
    width: 100%;
    height: 100%;
}

.shuoshuo-external-link .external-link:hover {
    color: white !important;
}

.shuoshuo-external-link .external-link:hover {
    text-decoration: none !important;
}

.shuoshuo-external-link .external-link-left {
    width: 60px;
    height: 60px;
    margin: 10px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
}

.shuoshuo-external-link .external-link-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: calc(100% - 80px);
    padding: 10px;
}

.shuoshuo-external-link .external-link-right .external-link-title {
    font-size: 1.0rem;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.shuoshuo-external-link .external-link-right i {
    margin-left: 5px;
}

.limit {
    width: 100%;
    text-align: center;
    margin-top: 30px;
    color: var(--liushen-text);
    opacity: 0.75;
}

#main_top {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0 0 16px;
}

#bber-talk {
  box-sizing: border-box;
  cursor: pointer;
  width: 100%;
  min-height: 50px;
  padding: .65rem 1rem;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-weight: 700;
  border-radius: 16px;
  background: var(--liushen-card-bg);
  border: var(--liushen-card-border);
  box-shadow: var(--card-box-shadow);
}

#bber-talk,
#bber-talk a {
  color: var(--liushen-text);
}

#bber-talk svg.icon {
  width: 1em;
  height: 1em;
  vertical-align: -.15em;
  fill: currentColor;
  overflow: hidden;
  font-size: 20px;
}

#bber-talk .item i {
  margin-left: 5px;
}

#bber-talk > i {
  font-size: 1.1rem;
}

#bber-talk .talk-list {
  flex: 1;
  max-height: 28px;
  font-size: 0.95rem;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

#bber-talk .talk-list:hover {
  color: var(--default-bg-color);
  transition: all .2s ease-in-out;
}

#bber-talk .talk-list li {
  list-style: none;
  width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 10px;
}

@media screen and (min-width: 770px) {
  #bber-talk .talk-list {
    text-align: center;
    margin-right: 20px;
  }
}

```

新增两个js文件
```js title="public/js/ech0-index-talk.js"
(() => {
	const apiUrl = "https://ech0.zzyang.top/api/echo/page";
	let talkTimer = null;
	const cacheDuration = 30 * 60 * 1000;
	const cacheKey = `talksCache:${apiUrl}`;
	const cacheTimeKey = `talksCacheTime:${apiUrl}`;

	function toText(list) {
		return list.map((item) => {
			let content = item.content || "";

			const hasImg = /!\[.*?\]\(.*?\)/.test(content);
			const hasLink = /\[.*?\]\(.*?\)/.test(content);

			content = content
				.replace(/#(.*?)\s/g, "")
				.replace(/\{.*?\}/g, "")
				.replace(/!\[.*?\]\(.*?\)/g, '<i class="fa-solid fa-image"></i>')
				.replace(/\[.*?\]\(.*?\)/g, '<i class="fa-solid fa-link"></i>');

			const icons = [];

			if (item.images?.length && !hasImg) icons.push("fa-solid fa-image");
			if (item.extension_type === "VIDEO") icons.push("fa-solid fa-video");
			if (item.extension_type === "MUSIC") icons.push("fa-solid fa-music");
			if (item.extension_type === "WEBSITE" && !hasLink)
				icons.push("fa-solid fa-link");
			if (item.extension_type === "GITHUBPROJ" && !hasLink)
				icons.push("fab fa-github");

			if (icons.length) {
				content += ` ${icons.map((icon) => `<i class="${icon}"></i>`).join(" ")}`;
			}

			return content;
		});
	}

	function renderTalk(list) {
		let html = "";
		list.forEach((item, index) => {
			html += `<li class="item item-${index + 1}">${item}</li>`;
		});

		const box = document.querySelector("#bber-talk .talk-list");
		if (!box) return;

		box.innerHTML = html;

		talkTimer = setInterval(() => {
			if (box.children.length > 0) {
				box.appendChild(box.children[0]);
			}
		}, 3000);
	}

	function indexTalk() {
		if (talkTimer) {
			clearInterval(talkTimer);
			talkTimer = null;
		}

		if (!document.getElementById("bber-talk")) return;

		const cachedData = localStorage.getItem(cacheKey);
		const cachedTime = localStorage.getItem(cacheTimeKey);
		const currentTime = Date.now();

		if (
			cachedData &&
			cachedTime &&
			currentTime - Number(cachedTime) < cacheDuration
		) {
			const data = toText(JSON.parse(cachedData));
			renderTalk(data.slice(0, 6));
			return;
		}

		fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ page: 1, pageSize: 30 }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.code === 1 && data.data && Array.isArray(data.data.items)) {
					localStorage.setItem(cacheKey, JSON.stringify(data.data.items));
					localStorage.setItem(cacheTimeKey, currentTime.toString());
					const formattedData = toText(data.data.items);
					renderTalk(formattedData.slice(0, 6));
				} else {
					console.warn("Unexpected API response format:", data);
				}
			})
			.catch((error) => console.error("Error fetching data:", error));
	}

	function init() {
		indexTalk();
	}

	if (!window.__ech0IndexTalkBound) {
		document.addEventListener("astro:page-load", init);
		window.__ech0IndexTalkBound = true;
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

```


```js title="public/js/ech0-shuoshuo.js"
(() => {
	const API_URL = "https://ech0.zzyang.top/api/echo/page";
	const TALK_CONTAINER_ID = "talk";
	const CACHE_DURATION = 30 * 60 * 1000;
	const CACHE_KEY = `talksCache:${API_URL}`;
	const CACHE_TIME_KEY = `talksCacheTime:${API_URL}`;

	const generateIconSVG = () =>
		`<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class="is-badge icon"><path d="m512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4zm-266.9 77.1 105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z" fill="#1da1f2"></path></svg>`;

	const _waterfall = (container) => {
		function getMargin(side, el) {
			const style = window.getComputedStyle(el);
			return Number.parseFloat(style[`margin${side}`]) || 0;
		}

		function px(value) {
			return `${value}px`;
		}

		function top(el) {
			return Number.parseFloat(el.style.top);
		}

		function left(el) {
			return Number.parseFloat(el.style.left);
		}

		function width(el) {
			return el.clientWidth;
		}

		function height(el) {
			return el.clientHeight;
		}

		function bottom(el) {
			return top(el) + height(el) + getMargin("Bottom", el);
		}

		function right(el) {
			return left(el) + width(el) + getMargin("Right", el);
		}

		function sortCols(cols) {
			cols.sort((a, b) =>
				bottom(a) === bottom(b) ? left(b) - left(a) : bottom(b) - bottom(a),
			);
		}

		function onResize(event) {
			if (width(container) !== containerWidth) {
				event.target.removeEventListener(event.type, onResize);
				_waterfall(container);
			}
		}

		if (typeof container === "string") {
			container = document.querySelector(container);
		}
		if (!container) return;

		const items = Array.from(container.children);
		items.forEach((el) => {
			el.style.position = "absolute";
		});
		container.style.position = "relative";

		const cols = [];
		if (items.length) {
			items[0].style.top = "0px";
			items[0].style.left = px(getMargin("Left", items[0]));
			cols.push(items[0]);
		}

		let index = 1;
		for (; index < items.length; index += 1) {
			const prev = items[index - 1];
			const current = items[index];
			const fits = right(prev) + width(current) <= width(container);
			if (!fits) break;
			current.style.top = prev.style.top;
			current.style.left = px(right(prev) + getMargin("Left", current));
			cols.push(current);
		}

		for (; index < items.length; index += 1) {
			sortCols(cols);
			const current = items[index];
			const col = cols.pop();
			current.style.top = px(bottom(col) + getMargin("Top", current));
			current.style.left = px(left(col));
			cols.push(current);
		}

		sortCols(cols);
		const tallest = cols[0];
		container.style.height = px(bottom(tallest) + getMargin("Bottom", tallest));
		const containerWidth = width(container);
		window.addEventListener("resize", onResize);
	};

	const formatTime = (time) => {
		const date = new Date(time);
		const pad = (value) => value.toString().padStart(2, "0");
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
			date.getDate(),
		)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
	};

	const normalizeTalk = (item) => {
		const date = formatTime(item.created_at);
		let content = item.content || "";
		content = content
			.replace(
				/\[(.*?)\]\((.*?)\)/g,
				`<a href="$2" target="_blank" rel="nofollow noopener">@$1</a>`,
			)
			.replace(/- \[ \]/g, "o")
			.replace(/- \[x\]/g, "x")
			.replace(/\n/g, "<br>");
		content = `<div class="talk_content_text">${content}</div>`;

		const origin = new URL(API_URL).origin;
		const images = Array.isArray(item.images)
			? item.images.map((img) => img.image_url).filter(Boolean)
			: Array.isArray(item.echo_files)
				? item.echo_files
						.map((fileItem) => fileItem?.file?.url)
						.filter(Boolean)
						.map((url) => (url.startsWith("http") ? url : `${origin}${url}`))
				: [];

		if (images.length > 0) {
			const imgDiv = document.createElement("div");
			imgDiv.className = "zone_imgbox";
			images.forEach((url) => {
				const link = document.createElement("a");
				link.href = `${url}?fmt=webp&q=75`;
				link.setAttribute("data-fancybox", "gallery");
				link.className = "fancybox";
				const imgTag = document.createElement("img");
				imgTag.src = `${url}?fmt=webp&q=75`;
				link.appendChild(imgTag);
				imgDiv.appendChild(link);
			});
			content += imgDiv.outerHTML;
		}

		const extensionType = item.extension?.type || item.extension_type || "";
		const extensionPayload =
			item.extension?.payload ||
			item.extension_payload ||
			item.extension ||
			null;

		if (["WEBSITE", "GITHUBPROJ"].includes(extensionType)) {
			let siteUrl = "";
			let title = "";
			let extensionBack = "https://img.meituan.net/content/76ce3481bf9a82056df39e03c54d6ba117154003.png";
			try {
				const extObj =
					typeof extensionPayload === "string"
						? JSON.parse(extensionPayload)
						: extensionPayload;
				siteUrl =
					extObj.site || extObj.url || extObj.repoUrl || extensionPayload;
				title = extObj.title || siteUrl;
			} catch {
				siteUrl = extensionPayload;
				title = siteUrl;
			}

			if (extensionType === "GITHUBPROJ") {
				extensionBack = "https://img.meituan.net/content/cc7948ab56f263bbe66e7562e53d6b0c1524.png";
				const match = siteUrl.match(
					/^https?:\/\/github\.com\/[^/]+\/([^/?#]+)/i,
				);
				if (match) {
					title = match[1];
				} else {
					try {
						const parts = new URL(siteUrl).pathname.split("/").filter(Boolean);
						title = parts.pop() || siteUrl;
					} catch {
						// keep original title
					}
				}
			}

			content += `
        <div class="shuoshuo-external-link">
          <a class="external-link" href="${siteUrl}" target="_blank" rel="nofollow noopener">
            <div class="external-link-left" style="background-image:url(${extensionBack})"></div>
            <div class="external-link-right">
              <div class="external-link-title">${title}</div>
              <div>Open<i class="fa-solid fa-angle-right"></i></div>
            </div>
          </a>
        </div>`;
		}

		if (extensionType === "MUSIC" && extensionPayload) {
			const link =
				typeof extensionPayload === "object"
					? extensionPayload.url
					: extensionPayload;
			let server = "";
			if (link.includes("music.163.com")) server = "netease";
			else if (link.includes("y.qq.com")) server = "tencent";
			const idMatch = link.match(/id=(\d+)/);
			const id = idMatch ? idMatch[1] : "";
			if (server && id) {
				content += `<meting-js server="${server}" type="song" id="${id}" api="https://met.liiiu.cn/meting/api?server=:server&type=:type&id=:id&auth=:auth&r=:r"></meting-js>`;
			}
		}

		if (extensionType === "VIDEO" && extensionPayload) {
			const video =
				typeof extensionPayload === "object"
					? extensionPayload.videoId
					: extensionPayload;
			if (video?.startsWith("BV")) {
				const bilibiliUrl = `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${video}&as_wide=1&high_quality=1&danmaku=0`;
				content += `
          <div style="position: relative; padding: 30% 45%; margin-top: 10px;">
            <iframe style="position:absolute;width:100%;height:100%;left:0;top:0;border-radius:12px;"
              src="${bilibiliUrl}"
              frameborder="no"
              allowfullscreen="true"
              loading="lazy"></iframe>
          </div>`;
			} else if (video) {
				const youtubeUrl = `https://www.youtube.com/embed/${video}`;
				content += `
          <div style="position: relative; padding: 30% 45%; margin-top: 10px;">
            <iframe style="position:absolute;width:100%;height:100%;left:0;top:0;border-radius:12px;"
              src="${youtubeUrl}"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>`;
			}
		}

		return {
			content,
			user: item.username || "Anonymous",
			avatar:
				"https://zzyang.oss-cn-hangzhou.aliyuncs.com/img/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_2026-03-18_002824_901.jpg",
			date,
			tags:
				Array.isArray(item.tags) && item.tags.length
					? item.tags.map((t) => t.name)
					: ["No Tags"],
			text: content.replace(/\[(.*?)\]\((.*?)\)/g, "[link]"),
		};
	};

	const generateTalkElement = (item) => {
		const talkItem = document.createElement("div");
		talkItem.className = "talk_item";

		const talkMeta = document.createElement("div");
		talkMeta.className = "talk_meta";
		const avatar = document.createElement("img");
		avatar.className = "no-lightbox avatar";
		avatar.src = item.avatar;

		const info = document.createElement("div");
		info.className = "info";
		const nick = document.createElement("span");
		nick.className = "talk_nick";
		nick.innerHTML = `${item.user} ${generateIconSVG()}`;
		const date = document.createElement("span");
		date.className = "talk_date";
		date.textContent = item.date;
		info.appendChild(nick);
		info.appendChild(date);
		talkMeta.appendChild(avatar);
		talkMeta.appendChild(info);

		const talkContent = document.createElement("div");
		talkContent.className = "talk_content";
		talkContent.innerHTML = item.content;

		const talkBottom = document.createElement("div");
		talkBottom.className = "talk_bottom";
		const tags = document.createElement("div");
		const tag = document.createElement("span");
		tag.className = "talk_tag";
		tag.textContent = `${item.tags}`;
		tags.appendChild(tag);

		const commentLink = document.createElement("a");
		commentLink.href = "javascript:;";
		commentLink.onclick = () => goComment(item.text);
		const icon = document.createElement("span");
		icon.className = "icon";
		icon.innerHTML = '<i class="fa-solid fa-message fa-fw"></i>';
		commentLink.appendChild(icon);

		talkBottom.appendChild(tags);
		talkBottom.appendChild(commentLink);

		talkItem.appendChild(talkMeta);
		talkItem.appendChild(talkContent);
		talkItem.appendChild(talkBottom);

		return talkItem;
	};

	const goComment = (text) => {
		const match = text.match(
			/<div class="talk_content_text">([\s\S]*?)<\/div>/,
		);
		const textContent = match ? match[1] : "";
		const textarea =
			document.querySelector(".atk-textarea") ||
			document.querySelector(".tk-input textarea") ||
			document.querySelector(".tk-comment-input textarea");
		if (!textarea) return;
		textarea.value = `> ${textContent}\n\n`;
		textarea.focus();
	};

	const renderTalksList = (list, container) => {
		list.map(normalizeTalk).forEach((item) => {
			container.appendChild(generateTalkElement(item));
		});
	};

	const fetchAndRenderTalks = (container) => {
		const cachedData = localStorage.getItem(CACHE_KEY);
		const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
		const now = Date.now();

		if (cachedData && cachedTime && now - Number(cachedTime) < CACHE_DURATION) {
			renderTalksList(JSON.parse(cachedData), container);
		}

		fetch(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ page: 1, pageSize: 30 }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.code === 1 && data.data && Array.isArray(data.data.items)) {
					const latestItems = data.data.items;
					const cachedItems = cachedData ? JSON.parse(cachedData) : [];
					const cachedFirstId = cachedItems[0]?.id;
					const latestFirstId = latestItems[0]?.id;

					if (!cachedFirstId || cachedFirstId !== latestFirstId) {
						container.innerHTML = "";
						renderTalksList(latestItems, container);
					}

					localStorage.setItem(CACHE_KEY, JSON.stringify(latestItems));
					localStorage.setItem(CACHE_TIME_KEY, now.toString());
				}
			})
			.catch((err) => console.error("Error fetching:", err));
	};

	const renderTalks = () => {
		const talkContainer = document.getElementById(TALK_CONTAINER_ID);
		if (!talkContainer) return;
		talkContainer.innerHTML = "";
		fetchAndRenderTalks(talkContainer);
	};

	const run = () => {
		renderTalks();
	};

	if (!window.__ech0TalkBound) {
		document.addEventListener("astro:page-load", run);
		window.__ech0TalkBound = true;
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", run);
	} else {
		run();
	}
})();

```

**修改config.ts**

```ts title="src/config.ts"
		LinkPreset.About,
		{
			name: "说说",
			url: "/shuoshuo/",
		},
		LinkPreset.Friends,
```

**新增组件**

```astro title="src/components/widget/Ech0TalkStrip.astro"
---
import { url } from "../../utils/url-utils";
---
<div id="main_top">
    <a id="bber-talk" class="card-base bb_talk_swipper" href={url("/shuoshuo/")} aria-label="Go to Shuoshuo">
        <svg
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
        >
            <path
                d="M526.432 924.064c-20.96 0-44.16-12.576-68.96-37.344L274.752 704H192c-52.928 0-96-43.072-96-96V416c0-52.928 43.072-96 96-96h82.752l182.624-182.624c24.576-24.576 47.744-37.024 68.864-37.024C549.184 100.352 576 116 576 160v704c0 44.352-26.72 60.064-49.568 60.064zM192 384c-17.632 0-32 14.368-32 32v192c0 17.664 14.368 32 32 32h96c8.48 0 16.64 3.36 22.624 9.376l192.064 192.096c3.392 3.36 6.496 6.208 9.312 8.576V174.016a145.824 145.824 0 0 0-9.376 8.608l-192 192C304.64 380.64 296.48 384 288 384h-96zM687.584 730.368a31.898 31.898 0 0 1-18.656-6.016c-14.336-10.304-17.632-30.304-7.328-44.672l12.672-17.344C707.392 617.44 736 578.624 736 512c0-69.024-25.344-102.528-57.44-144.928-5.664-7.456-11.328-15.008-16.928-22.784-10.304-14.336-7.04-34.336 7.328-44.672 14.368-10.368 34.336-7.04 44.672 7.328 5.248 7.328 10.656 14.464 15.968 21.504C764.224 374.208 800 421.504 800 512c0 87.648-39.392 141.12-74.144 188.32l-12.224 16.736c-6.272 8.704-16.064 13.312-26.048 13.312z"
                p-id="3947"
            ></path>
            <path
                d="M796.448 839.008a31.906 31.906 0 0 1-21.088-7.936c-13.28-11.648-14.624-31.872-2.976-45.152C836.608 712.672 896 628.864 896 512s-59.392-200.704-123.616-273.888c-11.648-13.312-10.304-33.504 2.976-45.184 13.216-11.648 33.44-10.336 45.152 2.944C889.472 274.56 960 373.6 960 512s-70.528 237.472-139.488 316.096c-6.368 7.232-15.2 10.912-24.064 10.912z"
                p-id="3948"
            ></path>
        </svg>
        <ul class="talk-list">说说加载中。。。</ul>
    </a>
</div>

```

**修改Layout.astro**

在111 line增加
```astro title="src/layouts/Layout.astro"
		<link rel="stylesheet" href={url("/css/ech0-talk.css")} media="all" />
		<link rel="stylesheet" href="https://fastly.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css" media="all" />
```

151 line 增加
```astro
		<script src="https://fastly.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js" defer></script>
		<script src="https://fastly.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js" defer></script>
```

**添加shuoshuo.astro**

```astro title="src/pages/shuoshuo.astro"
---
import MainGridLayout from "../layouts/MainGridLayout.astro";
---
<MainGridLayout title="键盘侠的日常哔哔" description="说说列表">
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32 mb-4">
        <div class="card-base z-10 px-6 md:px-9 pt-6 pb-8 relative w-full">
            <div id="talk"></div>
            <div class="limit">- 只展示最近30条说说 -</div>
        </div>
    </div>
    <script src="/js/ech0-shuoshuo.js" is:inline></script>
</MainGridLayout>

```

至此结束，看所有完整的可以看我的 [github](https://github.com/zxyang3636/CodeVoy)