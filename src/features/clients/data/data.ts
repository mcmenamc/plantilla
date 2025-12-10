import { faker } from '@faker-js/faker'

export const clients = Array.from({ length: 20 }, () => {
    return {
        id: faker.string.uuid(),
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        rfc: faker.string.alphanumeric(13).toUpperCase(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        createdAt: faker.date.past(),
    }
})
