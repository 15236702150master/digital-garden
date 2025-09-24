export function parseWikiLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const links: string[] = []
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1])
  }

  return links
}

export function replaceWikiLinksWithHTML(content: string, onLinkClick?: (title: string) => void): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
    return `<a href="#" class="wiki-link text-blue-600 hover:text-blue-800 underline" data-title="${title}">${title}</a>`
  })
}
