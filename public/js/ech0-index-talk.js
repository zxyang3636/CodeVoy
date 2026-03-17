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
