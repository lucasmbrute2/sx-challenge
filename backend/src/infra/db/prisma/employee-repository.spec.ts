import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaEmployeeRepository } from "./employee-repository";
import { makeEmployee } from "@/domain/entities/tests/factories";
import { Employee } from "@/domain/entities/employee";
import { PrismaCompanyMapper } from "./mappers/company-mapper";
import { makeCompany } from "@/domain/entities/tests/factories";

const makeSut = (): PrismaEmployeeRepository => {
  return new PrismaEmployeeRepository()
}

describe("PrismaEmployeeRepository", () => {
  const prisma = new PrismaClient()
  let schema: string

  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      throw new Error('Please provide a DATABASE_URL environment variable')
    }
    schema = randomUUID()
    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.set("schema", schema)

    process.env.DATABASE_URL = url.toString()
    execSync("npx prisma migrate deploy")
  })

  afterAll(async () => {
    await prisma.$queryRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schema}" CASCADE`
    )
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.company.deleteMany({})
  })

  // add()
  it("Should return an Employee on success", async () => {
    const sut = makeSut()
    const companyModel = makeCompany()
    await prisma.company.create({
      data: PrismaCompanyMapper.toPrisma(companyModel)
    })
    const employee = await sut.add(makeEmployee({ companyId: companyModel.id }))

    expect(employee).toBeInstanceOf(Employee)
    expect(employee).toBeTruthy()
    expect(employee).toEqual(makeEmployee())
  })
})