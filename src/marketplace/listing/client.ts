import { getAccountLabel, listAccounts } from '../account/index'
import { uuid } from './helpers/uuid'
import type { ListingRecord } from './types'

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=80`

export const DEFAULT_LISTING_IMAGE = img('photo-1558618666-fcd25c85cd64')

const SEED_LISTINGS: ListingRecord[] = [
  {
    id: uuid(),
    listingId: '38629807913299080',
    title: 'Rubbish Removal in Galway',
    price: '50',
    category: 'Household',
    condition: 'Used - fair',
    location: 'Galway, Ireland',
    accountId: 'fbGalwayRubbish',
    account: 'Galway Rubbish Co',
    locationPoint: { lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    images: [img('photo-1558618666-fcd25c85cd64'), img('photo-1618221195710-dd6b41faaea6')],
    status: 'underReviewDuplicate',
    listingUrl: 'https://facebook.com/marketplace/item/38629807913299080',
    publishedAt: '2026-09-09T18:42:00+00:00'
  },
  {
    id: uuid(),
    listingId: '1583545526797714',
    title: 'Junk Clearance — Salthill',
    price: '40',
    category: 'Household',
    condition: 'Used - fair',
    location: 'Salthill, Ireland',
    locationPoint: { lat: 53.2598, lng: -9.076, radiusKm: 5 },
    accountId: 'fbGalwayRubbish',
    account: 'Galway Rubbish Co',
    images: [img('photo-1585060544812-6b45742d762f'), img('photo-1581578731548-c64695cc6952')],
    status: 'active',
    listingUrl: 'https://facebook.com/marketplace/item/1583545526797714',
    publishedAt: '2026-09-10T09:15:00+00:00'
  },
  {
    id: uuid(),
    listingId: '104277813520114',
    title: 'Garden Waste Hauling — Galway Bay',
    price: '60',
    category: 'Household',
    condition: 'Used - good',
    location: 'Moycullen, Ireland',
    locationPoint: { lat: 53.3833, lng: -9.1667, radiusKm: 8 },
    accountId: 'fbPersonal',
    account: 'Facebook',
    images: [img('photo-1416879595882-3373a0480b5b'), img('photo-1558618666-fcd25c85cd64')],
    status: 'sold',
    listingUrl: 'https://facebook.com/marketplace/item/104277813520114',
    publishedAt: '2026-09-11T14:05:00+00:00'
  },
  {
    id: uuid(),
    listingId: '882133740619252',
    title: 'Man with a Van — Galway & Surrounds',
    price: '35',
    category: 'Household',
    condition: null,
    location: 'Oranmore, Ireland',
    locationPoint: { lat: 53.2667, lng: -8.9333, radiusKm: 8 },
    accountId: 'fbPacer',
    account: 'Pacer Marketplace',
    images: [img('photo-1600518464441-9154a4beb221'), img('photo-1558618666-fcd25c85cd64')],
    status: 'underReview',
    listingUrl: 'https://facebook.com/marketplace/item/882133740619252',
    publishedAt: '2026-09-12T08:30:00+00:00'
  },
  {
    id: uuid(),
    listingId: '775091462828331',
    title: 'Patio Set — 6 Pieces, Bamboo',
    price: '120',
    category: 'Furniture',
    condition: 'Used - good',
    location: 'Galway, Ireland',
    accountId: 'fbPacer',
    account: 'Pacer Marketplace',
    locationPoint: { lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    images: [img('photo-1618221195710-dd6b41faaea6'), img('photo-1493809842364-78817add7ffb')],
    status: 'removed',
    removedBy: 'seller',
    listingUrl: 'https://facebook.com/marketplace/item/775091462828331',
    publishedAt: '2026-09-12T16:48:00+00:00'
  },
  {
    id: uuid(),
    listingId: '664120887304197',
    title: 'Wardrobe — 3 Doors, Teak',
    price: '85',
    category: 'Furniture',
    condition: 'Used - good',
    location: 'Galway, Ireland',
    locationPoint: { lat: 53.2667, lng: -9.0333, radiusKm: 10 },
    accountId: 'fbPersonal',
    account: 'Facebook',
    images: [img('photo-1532372320572-cda25653a26d'), img('photo-1558618666-fcd25c85cd64')],
    status: 'removed',
    removedBy: 'platform',
    listingUrl: 'https://facebook.com/marketplace/item/664120887304197',
    publishedAt: '2026-09-13T10:22:00+00:00'
  }
]
export function listListings(): ListingRecord[] {
  const accounts = listAccounts()
  return SEED_LISTINGS.map((row) => ({
    ...row,
    account: getAccountLabel(accounts, row.accountId),
    images: [...row.images]
  }))
}
