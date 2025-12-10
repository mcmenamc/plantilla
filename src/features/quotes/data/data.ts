import { faker } from '@faker-js/faker'

export const quotes = Array.from({ length: 20 }, () => {
    return {
        id: faker.string.uuid(),
        folio: `COT-${faker.number.int({ min: 1000, max: 9999 })}`,
        client: faker.company.name(),
        total: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        status: faker.helpers.arrayElement(['draft', 'sent', 'accepted', 'rejected']),
        date: faker.date.recent(),
        validUntil: faker.date.future(),
    }
})
