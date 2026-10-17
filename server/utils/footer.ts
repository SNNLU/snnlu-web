/* 页脚里的两个占位：{{commit}} 换成本次构建的提交号小框（样式同旧站 .commit-link），{{ext}} 换成外链箭头 */
const REPO = 'https://github.com/SNNLU/snnlu-web'

const GH_MARK = '<svg class="gh-mark" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>'

const EXT_ARROW = '<svg class="ext-arrow" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

export function footerHtml(src: string) {
  const sha = String(useRuntimeConfig().commit || '')
  const href = sha ? `${REPO}/commit/${sha}` : `${REPO}/commits/main`
  const badge = `<a class="commit-link" href="${href}" target="_blank" rel="noopener" title="GitHub 提交记录">${GH_MARK}<code>${sha ? sha.slice(0, 7) : 'main'}</code></a>`
  return segments(src).replace('{{commit}}', badge).replace('{{ext}}', EXT_ARROW)
}

/* 「地址 | 邮编 | 电话 | 提交号」：每段包成不折行的块，竖线单独一块、其后可换行；
   竖线落在行尾时由 SiteFooter 藏起（行尾的分隔符没有分隔作用） */
const SEP = /((?:&nbsp;|\s)*\|(?:&nbsp;|\s)*)/
function segments(src: string) {
  return src.replace(/>([^<>]*)<\/span>\{\{commit\}\}/, (_, text: string) => {
    const parts = text.split(SEP)
    let html = ''
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i]) html += `<span class="ft-seg">${parts[i]}</span>`
      if (parts[i + 1]) html += `<span class="ft-sep">${parts[i + 1]}</span><wbr>`
    }
    return `>${html}</span><span class="ft-seg">{{commit}}</span>`
  })
}
