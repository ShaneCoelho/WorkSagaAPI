const { request } = require("express")
const supertest=require("supertest")
const app=require('../app')
describe('Create a new user',()=>{
    describe('Createuser validation missing parameters', () => {
        describe('missing password field', () => {
            const payload={
                name:"JAkeee",
                passowrd:'',
                mobileNo:8858487323,
                email:"jj@gmail.com"
            }
            test('should first', async () => { 
                await supertest(app).post("/api/auth/createuser").send(payload).expect(400)
             })
         })
     })
})