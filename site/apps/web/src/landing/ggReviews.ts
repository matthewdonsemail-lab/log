/**
 * Real public replies on X, the same list the gg page shows (ui-kit memberSites/engine/gg.ts `REVIEWS`,
 * fetched with treg on 2026-10-13 from the 203k-view post and the launch post). Own replies excluded.
 * `**words**` render as sticker keywords.
 */
export type Review = { quote: string; name: string; handle: string; photo: string }

export const GG_REVIEWS: Review[] = [
  { quote: 'yo mate so cool **Treg helped you out**', name: 'Jason Zhou', handle: '@jasonzhou1993' },
  { quote: 'the **30 convos in two days** is the real flex, not the tool.', name: 'Lucyyy', handle: '@lucy_puppyy' },
  { quote: '30 real conversations for $10 is **wild**.', name: 'Steven', handle: '@StephGlansberg' },
  { quote: 'Whoa, this is **next level** for GTM people', name: 'Taus', handle: '@ShehjadTaus' },
  { quote: 'matt, the **clay sales team** hates you now', name: 'Anderson', handle: '@ItsGoharr' },
  { quote: 'Gonna check out the **OSS repo**!', name: 'AI Builder Club', handle: '@aibuilderclub_' },
  { quote: 'Yoo this is **insane** launch video!', name: 'Treg', handle: '@treg_ai' },
  { quote: 'Jason is literally **FREE**', name: 'Knowix', handle: '@knowixbuilds' },
  { quote: 'this is **amazing**', name: 'SuperDesign.Dev', handle: '@SuperDesignDev' },
  { quote: 'JASON IS **THE BEST**', name: 'Eyal Toledano', handle: '@EyalToledano' },
  { quote: 'all the best man 🔥🔥', name: 'Brian', handle: '@LimYiShengBrian' },
  { quote: '**YOOOOOO**', name: 'Mitchell Keller', handle: '@MitchellKeller_' },
].map((r) => ({ ...r, photo: `https://unavatar.io/x/${r.handle.slice(1)}` }))
