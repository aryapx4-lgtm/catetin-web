import { z } from "zod"

const phoneRegex = /^(\+?62|0)8\d{8,12}$/
const gmailRegex = /@gmail\.com$/i

export function normalizePhone(input: string): string {
  const stripped = input.replace(/\s|-/g, "")
  if (stripped.startsWith("+62")) return "62" + stripped.slice(3)
  if (stripped.startsWith("0")) return "62" + stripped.slice(1)
  if (stripped.startsWith("62")) return stripped
  return stripped
}

const personSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid")
    .regex(gmailRegex, "Email harus @gmail.com"),
  phone: z
    .string()
    .trim()
    .refine((v) => phoneRegex.test(v.replace(/\s|-/g, "")), "Nomor WA tidak valid"),
})

export const checkoutSchema = z
  .object({
    planId: z.enum(["single", "couple"]),
    duration: z.union([z.literal(1), z.literal(3), z.literal(12)]),
    owner: personSchema.extend({
      password: z.string().min(8, "Password minimal 8 karakter"),
      consent_marketing: z.boolean().optional().default(false),
    }),
    partner: personSchema.optional(),
  })
  .refine(
    (data) => data.planId !== "couple" || !!data.partner,
    { message: "Data pasangan wajib diisi untuk paket Couple", path: ["partner"] },
  )
  .refine(
    (data) =>
      data.planId !== "couple" ||
      !data.partner ||
      data.owner.email.toLowerCase() !== data.partner.email.toLowerCase(),
    { message: "Email pasangan tidak boleh sama dengan email kamu", path: ["partner", "email"] },
  )

export type CheckoutInput = z.infer<typeof checkoutSchema>

// Mayar Headless API webhook payload.
// Schema final disesuaikan dengan payload Mayar real saat testing —
// asumsi awal mengikuti dokumentasi standar Mayar: event di top-level,
// detail transaksi di `data.*`. Field yang gak dipakai dibiarkan optional.
export const mayarWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    referenceId: z.string(),
    status: z.string().optional(),
    amount: z.number().optional(),
    customerEmail: z.string().optional(),
    customerName: z.string().optional(),
    customerMobile: z.string().optional(),
    paymentType: z.string().optional(),
  }),
})

export type MayarWebhook = z.infer<typeof mayarWebhookSchema>
