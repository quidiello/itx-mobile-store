import { z } from 'zod'

const EMPTY_MARKERS = new Set(['', '-'])

const text = z
  .union([z.string(), z.array(z.string())])
  .nullish()
  .transform((value) => {
    const joined = Array.isArray(value)
      ? value.filter((item) => item.trim() !== '').join(', ')
      : (value ?? '')
    const trimmed = joined.trim()
    return EMPTY_MARKERS.has(trimmed) ? null : trimmed
  })

// No usar z.coerce.number(): convierte "" en 0
const numeric = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((value) => {
    if (value == null || String(value).trim() === '') return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  })

const option = z.object({
  code: z.number().int(),
  name: z.string(),
})

export const productSchema = z.object({
  id: z.string(),
  brand: text,
  model: text,
  price: numeric,
  imgUrl: text,
})

export const productDetailSchema = productSchema
  .extend({
    cpu: text,
    ram: text,
    os: text,
    battery: text,
    weight: numeric,
    primaryCamera: text,
    // Con los typos del API
    secondaryCmera: text,
    dimentions: text,
    // Intercambiados en el API: displayResolution trae pulgadas y displaySize píxeles
    displayResolution: text,
    displaySize: text,
    options: z
      .object({
        colors: z.array(option).default([]),
        storages: z.array(option).default([]),
      })
      .default({ colors: [], storages: [] }),
  })
  .transform(({ secondaryCmera, dimentions, displayResolution, displaySize, ...rest }) => ({
    ...rest,
    secondaryCamera: secondaryCmera,
    dimensions: dimentions,
    screenSize: displayResolution,
    screenResolution: displaySize,
  }))

export const cartResponseSchema = z.object({
  count: z.number().int().nonnegative(),
})

export type Product = z.output<typeof productSchema>
export type ProductDetail = z.output<typeof productDetailSchema>
export type ProductOption = z.output<typeof option>
