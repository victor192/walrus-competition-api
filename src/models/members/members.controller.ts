import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Body,
  InternalServerErrorException,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { MemberService } from './member.service';
import { MembersService } from './members.service';
import { GetMembersFilterDTO } from './dto/members-filter.dto';
import { GetMembersListResponseDTO } from '@models/members/dto/members.dto';
import { MemberSerializerService } from './serializers/member.serializer';
import { MembersSerializerService } from './serializers/members.serializer';
import { SerializerInterceptor } from '@common/interceptors/serializer.interceptor';
import { CreateMemberRequestDTO } from '@models/members/dto/create-member.dto';
import { GetMemberResponseDTO } from './dto/member.dto';
import { IdParamDTO } from '@common/dto/id-param.dto';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
@UseInterceptors(SerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(
    private readonly memberService: MemberService,
    private readonly membersService: MembersService,
    private readonly memberSerializerService: MemberSerializerService,
    private readonly membersSerializerService: MembersSerializerService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Add a new member' })
  @ApiResponse({
    status: 200,
    type: GetMemberResponseDTO,
    description: 'Successful create member response',
  })
  @HttpCode(200)
  async createMember(
    @Body()
    {
      first_name,
      last_name,
      middle_name,
      birthdate,
      gender,
      para_swimmer,
      club_id,
      email,
      phone,
      location,
    }: CreateMemberRequestDTO,
  ): Promise<GetMemberResponseDTO> {
    const [isMemberCreated, member] = await this.memberService.createMember(
      first_name,
      last_name,
      middle_name,
      birthdate,
      gender,
      para_swimmer,
      club_id,
      email,
      phone,
      location,
    );

    if (!isMemberCreated) {
      throw new InternalServerErrorException('Could not create member');
    }

    return {
      data: this.memberSerializerService.markSerializableValue(member),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get members list' })
  @ApiResponse({
    status: 200,
    type: GetMembersListResponseDTO,
    description: 'Successful get member list response',
  })
  async getMembers(
    @Query(ValidationPipe)
    {
      limit,
      offset,
      sort,
      direction,
      club_id,
      gender,
      min_age,
      max_age,
      search,
    }: GetMembersFilterDTO,
  ): Promise<GetMembersListResponseDTO> {
    const [members, total] = await this.membersService.findAll(
      limit,
      offset,
      sort,
      direction,
      club_id,
      gender,
      min_age,
      max_age,
      search,
    );

    return {
      data: this.membersSerializerService.markSerializableCollection(members),
      total,
      limit,
      offset,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    type: GetMemberResponseDTO,
    description: 'Successful get member data response',
  })
  async getMember(@Param() { id }: IdParamDTO): Promise<GetMemberResponseDTO> {
    const [isMemberExists, member] = await this.memberService.findOne(id);

    if (!isMemberExists) {
      throw new NotFoundException('Member not found');
    }

    return {
      data: this.memberSerializerService.markSerializableValue(member),
    };
  }
}
