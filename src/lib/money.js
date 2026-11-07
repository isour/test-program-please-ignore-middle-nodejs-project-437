export const money = amount => ({ amount: Number(amount), currency: 'RUB' })
export const amount = value => (typeof value === 'object' ? Number(value.amount) : Number(value))
