export const actionTemplates: Record<string, string> = {
  隐忍观察: '我垂目不语，暗中观察周围每一个人的表情与站位。',
  记下列人的脸: '我把今日见过的宫女、内侍一一记在心里，留待日后清算。',
  向皇后请安: '我强忍膝痛，恭声向皇后娘娘请安，言辞不卑不亢。',
  掌嘴跋扈宫女: '我当众掌了那宫女一记耳光，要拉她去内务府评理。',
  御花园闲逛: '我到御花园散步，留意各宫动向与可结交之人。',
  才艺献舞: '我在宫宴上献上一支舞，博取圣心。',
  结交贤妃: '我应贤妃柳如烟之约，前往她宫中品茶叙话。',
  应答德妃考题: '我回答德妃安若兰在御花园的试探之问。',
  收集把柄: '我命眼线暗中查账、盯梢，搜集可握在手中的把柄。',
  当众打脸: '我在皇帝与六宫面前，亮出把柄，当众揭发对方罪行。',
  呈证御前: '我将铁证跪呈皇帝，请圣裁。',
}

export function buildActionFromLabel(label: string): string {
  const trimmed = label.trim()
  if (actionTemplates[trimmed]) return actionTemplates[trimmed]
  if (trimmed.startsWith('我')) return trimmed.endsWith('。') ? trimmed : `${trimmed}。`
  return `我${trimmed.endsWith('。') ? trimmed : `${trimmed}。`}`
}
