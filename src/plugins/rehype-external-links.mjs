import { visit } from "unist-util-visit";

function isExternalHref(href) {
	if (typeof href !== "string" || href.length === 0) {
		return false;
	}

	if (
		href.startsWith("#") ||
		href.startsWith("/") ||
		href.startsWith("./") ||
		href.startsWith("../")
	) {
		return false;
	}

	if (/^(mailto:|tel:|sms:|javascript:)/i.test(href)) {
		return false;
	}

	return /^https?:\/\//i.test(href) || href.startsWith("//");
}

function normalizeRel(rel) {
	if (Array.isArray(rel)) {
		return rel;
	}
	if (typeof rel === "string") {
		return rel
			.split(" ")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
}

export function rehypeExternalLinks() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "a") return;

			const href = node.properties?.href;
			if (!isExternalHref(href)) return;

			node.properties = node.properties || {};
			node.properties.target = "_blank";

			const relSet = new Set(normalizeRel(node.properties.rel));
			relSet.add("noopener");
			relSet.add("noreferrer");
			node.properties.rel = Array.from(relSet).join(" ");
		});
	};
}

