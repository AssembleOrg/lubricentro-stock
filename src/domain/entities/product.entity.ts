export class Product {
  constructor(
    public readonly id: number,
    public readonly code: number,
    public readonly description: string,
    public readonly productTypeId: number,
    public readonly costPrice: number,
    public readonly publicPrice: number,
    public readonly stock: number,
    public readonly isActive: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

