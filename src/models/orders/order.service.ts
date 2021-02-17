import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Race } from '@models/races/entities/race.entity';
import { Relay } from '@models/relays/entities/relay.entity';
import { Cryatlon } from '@models/cryatlons/entities/cryatlon.entity';
import { Gender } from '@common/enums/gender.enum';
import { CompetitionService } from '@models/competitions/competition.service';
import { OrderMailNotifyService } from './order-mail-notify.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly competitionService: CompetitionService,
    private readonly orderMailNotify: OrderMailNotifyService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Race)
    private raceRepository: Repository<Race>,
    @InjectRepository(Relay)
    private relayRepository: Repository<Relay>,
    @InjectRepository(Cryatlon)
    private cryathlonRepository: Repository<Cryatlon>,
  ) {}

  async createOrder(
    competition_id: number,
    first_name: string,
    last_name: string,
    middle_name: string | null,
    birthdate: Date,
    gender: Gender,
    club_name: string,
    location: string,
    email: string,
    phone: string,
    races: number[] | null,
    relays: number[] | null,
    cryathlon_id: number | null,
    additional: string | null,
  ): Promise<[boolean, string, Order]> {
    try {
      const [
        isCompetitionExist,
        competition,
      ] = await this.competitionService.findOne(competition_id);

      if (!isCompetitionExist) {
        return [false, 'competition_not_found', null];
      }

      if (!races && !relays && !cryathlon_id) {
        return [false, 'no_orders', null];
      }

      const availableRaces = races
        ? await this.raceRepository.findByIds(races)
        : [];
      const availableRelays = relays
        ? await this.relayRepository.findByIds(relays)
        : [];
      const availableCryathlon = cryathlon_id
        ? await this.cryathlonRepository.findOne(cryathlon_id)
        : null;

      const order = new Order({
        competition,
        first_name,
        last_name,
        middle_name,
        birthdate,
        club_name,
        location,
        gender,
        email,
        phone,
        races: availableRaces,
        relays: availableRelays,
        cryathlon: availableCryathlon,
        additional,
        processed: false,
      });

      await order.save();
      await this.orderMailNotify.sendNewOrderNotify(order);

      return [true, '', order];
    } catch (error) {
      this.logger.error(error);

      return [false, 'exception_error', null];
    }
  }
}
