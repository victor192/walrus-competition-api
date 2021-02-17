import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailConfigModule } from '@config/mail/config.module';
import { Competition } from '@models/competitions/entities/competition.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { MailConfigService } from '@config/mail/config.service';
import { OrderMailNotifyService } from './order-mail-notify.service';
import { CompetitionService } from '@models/competitions/competition.service';
import { OrdersController } from './orders.controller';
import { Race } from '@models/races/entities/race.entity';
import { Relay } from '@models/relays/entities/relay.entity';
import { Cryatlon } from '@models/cryatlons/entities/cryatlon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Competition, Order, Race, Relay, Cryatlon]),
    MailConfigModule,
  ],
  providers: [
    CompetitionService,
    MailConfigService,
    OrderMailNotifyService,
    OrderService,
  ],
  controllers: [OrdersController],
})
export class OrdersModule {}
