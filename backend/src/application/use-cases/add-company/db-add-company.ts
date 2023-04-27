import { CompanyRepository } from "@/application/protocols/add-company-repository";
import { Company } from "@/domain/entities/company";
import { AddCompany, AddCompanyModel } from "@/domain/use-cases/add-company";

export class DbAddCompanyUseCase implements AddCompany {
  constructor(private readonly companyRepository: CompanyRepository) { }

  async add(companyData: AddCompanyModel): Promise<Company> {
    const company = new Company(companyData)


    await this.companyRepository.add(company)
    return company
  }
}