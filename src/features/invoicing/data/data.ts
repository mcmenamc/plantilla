import { faker } from '@faker-js/faker'

export const invoices = Array.from({ length: 20 }, () => {
    return {
        id: faker.string.uuid(),
        folio: `F-${faker.number.int({ min: 1000, max: 9999 })}`,
        client: faker.company.name(),
        total: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        status: faker.helpers.arrayElement(['paid', 'pending', 'cancelled']),
        date: faker.date.recent(),
        type: 'factura',
    }
})
