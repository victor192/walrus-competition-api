import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<[boolean, User]> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return [false, null];
    }

    return [true, user];
  }

  async findByEmail(email: string): Promise<[boolean, User]> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return [false, null];
    }

    return [true, user];
  }
}
