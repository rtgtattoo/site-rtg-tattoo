export const ORIGIN = 'https://www.rtgtattoo.com.br';
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const jsonScript = value => JSON.stringify(value).replace(/</g, '\\u003c');
export const paragraphs = value => String(value).split(/\n\s*\n/).map(p => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`).join('');
export const whatsapp = (site, message = 'Olá! Gostaria de conversar sobre uma tatuagem.') => `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;

export function validateSite(site) {
  for (const field of ['name', 'seoTitle', 'seoDescription', 'portfolioTitle', 'portfolioText']) required(site[field], field);
  for (const field of ['title', 'text', 'image', 'imageAlt', 'button', 'eyebrow']) required(site.hero?.[field], `hero.${field}`);
  for (const field of ['title', 'text', 'image', 'imageAlt']) required(site.about?.[field], `about.${field}`);
  for (const field of ['phoneLabel', 'email', 'street', 'neighborhood', 'city', 'state', 'hours', 'instagramLabel']) required(site.contact?.[field], `contact.${field}`);
  if (!/^\d{10,15}$/.test(site.contact.whatsapp)) throw Error('WhatsApp deve conter apenas dígitos, incluindo país e DDD.');
  for (const field of ['maps', 'instagram']) {
    const url = new URL(site.contact[field]);
    if (url.protocol !== 'https:') throw Error(`URL inválida: contact.${field}`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contact.email)) throw Error('Email inválido.');
  if (!Array.isArray(site.about.team) || site.about.team.length < 1) throw Error('Informe a equipe.');
  site.about.team.forEach(member => ['name', 'role', 'bio', 'image'].forEach(f => required(member[f], `team.${f}`)));
  if (!Array.isArray(site.faq)) throw Error('FAQ inválida.');
  site.faq.forEach(item => ['question', 'answer'].forEach(f => required(item[f], `faq.${f}`)));
  if (site.banner?.enabled) ['text', 'button'].forEach(f => required(site.banner[f], `banner.${f}`));
}
export function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw Error(`Campo obrigatório: ${field}`);
}
export function validateWork(work) {
  for (const field of ['title', 'category', 'image', 'alt', 'description']) required(work[field], field);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.slug)) throw Error(`Slug inválido: ${work.slug}`);
  if (typeof work.published !== 'boolean') throw Error(`Informe publicado em ${work.slug}`);
  if (!Number.isFinite(work.order)) throw Error(`Ordem inválida: ${work.slug}`);
}
