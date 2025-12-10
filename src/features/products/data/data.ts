import { faker } from '@faker-js/faker'

export const products = Array.from({ length: 20 }, () => {
    return {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        code: faker.string.alphanumeric(6).toUpperCase(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        createdAt: faker.date.past(),
    }
})
