export function snakeToTitle(text: string) {
	return text.replace(/^_*(.)|_+(.)/g, (s, c, d) => (c ? c.toUpperCase() : ` ${d.toUpperCase()}`))
}
