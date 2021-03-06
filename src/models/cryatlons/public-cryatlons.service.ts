import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cryatlon } from './entities/cryatlon.entity';
import { OrderStatuses } from '@models/orders/enums/order-statuses.enum';

@Injectable()
export class PublicCryatlonsService {
  private readonly logger = new Logger(PublicCryatlonsService.name);

  constructor(
    @InjectRepository(Cryatlon)
    private cryatlonsRepository: Repository<Cryatlon>,
  ) {}

  async findAll(id: number): Promise<Cryatlon[]> {
    return await this.cryatlonsRepository
      .createQueryBuilder('cryatlon')
      .leftJoinAndSelect('cryatlon.orders', 'order')
      .where('cryatlon.competition_id = :id', { id })
      .andWhere('order.status != :rejected', {
        rejected: OrderStatuses.Rejected,
      })
      .getMany();
  }
}
