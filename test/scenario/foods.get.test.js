/* global after before */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request

import { app, connection, server } from '../../src/server.js'
import { FoodItemModel } from '../../src/models/FoodItem.js'
import { foods } from './mock-data/foods.js'

const expect = chai.expect
chai.use(chaiHttp) // must have for chai.request

describe('scenario - GET foods/', () => {
  before(async () => {
    await FoodItemModel.insertMany(foods)
  })
  after(async () => {
    await FoodItemModel.deleteMany()
  })

  it('should return 200 for food route and return first 7 food items after sortin in alphabetical order', async () => {
    const exp = [
      {
        name: 'Balsamvinäger Vit',
        brand: 'Zeta',
        ean: '7350002401095',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07350002401095_C1N1_s02'
        },
        kcal_100g: 97,
        macros_100g: {
          fat: 0,
          saturatedFat: 0,
          carbohydrates: 20,
          sugars: 20,
          protein: 0,
          salt: 0.01,
          fiber: 0
        }
      },
      {
        name: 'Chicken&steak Kvarn',
        brand: 'Santa Maria',
        ean: '7311310026745',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07311310026745_C1N1_s02'
        },
        kcal_100g: 269,
        macros_100g: {
          fat: 4,
          saturatedFat: 0.5,
          carbohydrates: 40,
          sugars: 14,
          protein: 11,
          salt: 21.1,
          fiber: 14
        }
      },
      {
        name: 'Citronmajonnäs',
        brand: 'Kavli',
        ean: '7311442111302',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07311442111302_C1N1_s04'
        },
        kcal_100g: 700,
        macros_100g: {
          fat: 76,
          saturatedFat: 5.8,
          carbohydrates: 3.1,
          sugars: 2.4,
          protein: 1.2,
          salt: 0.8,
          fiber: 0
        }
      },
      {
        name: 'Crème Fraiche Kokbar 32%',
        brand: 'Falköpings',
        ean: '7393061003770',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07393061003770_C1N1_s01'
        },
        kcal_100g: 310,
        macros_100g: {
          fat: 32,
          saturatedFat: 20,
          carbohydrates: 2.4,
          sugars: 2.4,
          protein: 2.4,
          salt: 0.1,
          fiber: 0
        }
      },
      {
        name: 'Dijonsenap Original',
        brand: 'Maille',
        ean: '3036810201280',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/03036810201280_C1N1_s01'
        },
        kcal_100g: 151,
        macros_100g: {
          fat: 11,
          saturatedFat: 0.6,
          carbohydrates: 3.5,
          sugars: 1.9,
          protein: 7,
          salt: 4.9,
          fiber: 0
        }
      },
      {
        name: 'Fant Gulasch Paprikash Kryddmix/4 Port',
        brand: 'Podravka',
        ean: '3850104075537',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/03850104075537_C1N1_s03'
        },
        kcal_100g: 302,
        macros_100g: {
          fat: 1.6,
          saturatedFat: 0.3,
          carbohydrates: 57,
          sugars: 30,
          protein: 11,
          salt: 13.9,
          fiber: 7.8
        }
      },
      {
        name: 'Jordgubb Smultron Original Yoghurt 2%',
        brand: 'Yoggi',
        ean: '7310865018465',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07310865018465_C1L1_s02'
        },
        kcal_100g: 78,
        macros_100g: {
          fat: 2,
          saturatedFat: 1.3,
          carbohydrates: 11,
          sugars: 10,
          protein: 3.3,
          salt: 0.07,
          fiber: 0
        }
      }
    ]

    const res = await chai.request(app)
      .get('/api/v1/foods')

    expect(res).to.have.status(200)

    const foodItems = res.body.foodItems
    expect(foodItems).to.be.an('array')

    expect(foodItems).to.deep.equal(exp)
    expect(foodItems).to.have.lengthOf(7)
    expect(res.body).to.have.property('total', 20)
    expect(res.body).to.have.property('page', 1)
    expect(res.body).to.have.property('pageSize', 7)
    expect(res.body).to.have.property('from', 1)
    expect(res.body).to.have.property('to', 7)
  })

  it('should return 200 for food route and return last 6 food items after sorting in alphabetical order, because total its 20 food items in total', async () => {
    const exp = [
      {
        name: 'Rundrut Normalgräddat Knäckebröd',
        brand: 'Leksands',
        ean: '7312080003110',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07312080003110_C1L1_s03'
        },
        kcal_100g: 350,
        macros_100g: {
          fat: 1.6,
          saturatedFat: 0.3,
          carbohydrates: 60,
          sugars: 0.5,
          protein: 8.9,
          salt: 1.2,
          fiber: 20
        }
      },
      {
        name: 'Sigir Salami Nöt',
        brand: 'Aladin',
        ean: '4018342172183',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/04018342172183_C1C1_s01'
        },
        kcal_100g: 432,
        macros_100g: {
          fat: 28,
          saturatedFat: 12,
          carbohydrates: 1.1,
          sugars: 0.8,
          protein: 19,
          salt: 4.1,
          fiber: 0
        }
      },
      {
        name: 'Skogsbär',
        brand: 'Risifrutti',
        ean: '7310090792628',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07310090792628_C1C1_s02'
        },
        kcal_100g: 111,
        macros_100g: {
          fat: 3.3,
          saturatedFat: 2.1,
          carbohydrates: 17,
          sugars: 10,
          protein: 3.1,
          salt: 0.16,
          fiber: 0
        }
      },
      {
        name: 'Tuc Original',
        brand: 'Lu',
        ean: '5410041001204',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/05410041001204_C1C1_s02'
        },
        kcal_100g: 482,
        macros_100g: {
          fat: 19,
          saturatedFat: 9,
          carbohydrates: 67,
          sugars: 7.1,
          protein: 8.3,
          salt: 1.7,
          fiber: 2.4
        }
      },
      {
        name: 'Vegeta Allkrydda Original Burk',
        brand: 'Podravka',
        ean: '3850104047589',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/03850104047589_C1N1_s02'
        },
        kcal_100g: 164,
        macros_100g: {
          fat: 0.5,
          saturatedFat: 0.2,
          carbohydrates: 32,
          sugars: 22,
          protein: 8.5,
          salt: 56.9,
          fiber: 0
        }
      },
      {
        name: 'Vitlökssmör',
        brand: 'Biggans',
        ean: '73501749',
        img: {
          sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/00000073501749_C1N1_s01'
        },
        kcal_100g: 623,
        macros_100g: {
          fat: 68,
          saturatedFat: 43,
          carbohydrates: 2,
          sugars: 0.6,
          protein: 1,
          salt: 3,
          fiber: 0
        }
      }

    ]

    const res = await chai.request(app)
      .get('/api/v1/foods?page=' + 3) // 20 items in total, 7 items per page
    console.log('fooditem count', foods.length)

    expect(res).to.have.status(200)

    const foodItems = res.body.foodItems
    expect(foodItems).to.be.an('array')

    expect(foodItems).to.deep.equal(exp)
    expect(foodItems).to.have.lengthOf(6)
    expect(res.body).to.have.property('total', 20)
    expect(res.body).to.have.property('page', 3)
    expect(res.body).to.have.property('pageSize', 6)
    expect(res.body).to.have.property('from', 15)
    expect(res.body).to.have.property('to', 20)
  })

  it('should return 200 for food route and return empty array because page out of range', async () => {
    const exp = []
    const res = await chai.request(app)
      .get('/api/v1/foods?page=' + 4) // 20 items in total, 7 items per page

    expect(res).to.have.status(200)

    const foodItems = res.body.foodItems
    expect(foodItems).to.be.an('array')

    expect(foodItems).to.deep.equal(exp)
    expect(foodItems).to.have.lengthOf(0)
    expect(res.body).to.have.property('total', 20)
    expect(res.body).to.have.property('page', 4)
    expect(res.body).to.have.property('pageSize', 0)
    expect(res.body).to.have.property('from', 0)
    expect(res.body).to.have.property('to', 0)
  })
})
