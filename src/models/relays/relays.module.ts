import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relay } from './entities/relay.entity';
import { PublicRelaysSerializerService } from './serializers/public-relays.serializer';
import { PublicRelaysService } from './public-relays.service';
import { RelaysController } from './relays.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Relay])],
  providers: [PublicRelaysSerializerService, PublicRelaysService],
  controllers: [RelaysController],
})
export class RelaysModule {}
