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
			let extensionBack =
				"https://img.meituan.net/content/351f403f21f8078a42328282b08c77cf1338.png";
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
				extensionBack =
					"https://img.meituan.net/content/cc7948ab56f263bbe66e7562e53d6b0c1524.png";
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
