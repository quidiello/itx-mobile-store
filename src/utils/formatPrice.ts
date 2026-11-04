import { config } from '@/config'

const options = { style: 'currency', currency: config.currency } as const
const wholeFormatter = new Intl.NumberFormat(config.locale, {
  ...options,
  maximumFractionDigits: 0,
})
const fullFormatter = new Intl.NumberFormat(config.locale, options)

export function formatPrice(price: number | null) {
  if (price === null) return 'Price not available'
  return (Number.isInteger(price) ? wholeFormatter : fullFormatter).format(price)
}
