import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { SpecialNeed } from '../special-need/entities/special-need.entity';
import { SpecialNeedSubcategory } from '../special-need/entities/special-need-subcategory.entity';
import { PaginationService } from '../../common/services/pagination.service';
import { QueryBuilderService } from '../../common/services/query-builder.service';
import {
  PaginationDto,
  PaginatedResponseDto,
  SortOrder,
} from '../helper/dto/pagination.dto';
import { StudentListDto } from './dto/student-list.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(SpecialNeed)
    private readonly specialNeedRepository: Repository<SpecialNeed>,
    @InjectRepository(SpecialNeedSubcategory)
    private readonly specialNeedSubcategoryRepository: Repository<SpecialNeedSubcategory>,
    private readonly paginationService: PaginationService,
    private readonly queryBuilderService: QueryBuilderService,
  ) {}

  async getAllStudents(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<StudentListDto>> {
    const { search, occupation, sortBy, sortOrder, ...paginationParams } =
      paginationDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.studentProfile', 'profile')
      .leftJoinAndSelect('profile.specialNeedSubcategories', 'subcategories')
      .leftJoinAndSelect('subcategories.specialNeed', 'specialNeed')
      .where('user.role = :role', { role: Role.STUDENT });

    // Apply search, filters and sorting (reutilizando o mesmo sistema)
    this.queryBuilderService.applySearchFiltersAndSorting(
      queryBuilder,
      search,
      { occupation },
      sortBy,
      sortOrder,
      {
        searchFields: ['firstName', 'lastName', 'email'],
        filterFields: { occupation: 'occupation' },
        sortableFields: [
          'firstName',
          'lastName',
          'email',
          'createdAt',
          'updatedAt',
        ],
        defaultSort: { field: 'createdAt', order: SortOrder.DESC },
      },
    );

    const paginatedResult = await this.paginationService.paginate(
      queryBuilder,
      paginationParams,
    );

    // Transform data
    const students = paginatedResult.data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      occupation: user.occupation,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // Dados do perfil
      phoneNumber: user.studentProfile?.phoneNumber,
      cpf: user.studentProfile?.cpf,
      rg: user.studentProfile?.rg,
      gender: user.studentProfile?.gender,
      maritalStatus: user.studentProfile?.maritalStatus,
      birthDate: user.studentProfile?.birthDate,
      course: user.studentProfile?.course,
      enrollmentDate: user.studentProfile?.enrollmentDate,

      // Endereço
      cep: user.studentProfile?.cep,
      state: user.studentProfile?.state,
      city: user.studentProfile?.city,
      neighborhood: user.studentProfile?.neighborhood,
      street: user.studentProfile?.street,
      number: user.studentProfile?.number,
      complement: user.studentProfile?.complement,

      // Necessidades especiais
      specialNeeds:
        user.studentProfile?.specialNeedSubcategories?.map((sub) => ({
          specialNeedId: sub.specialNeed?.id,
          specialNeedName: sub.specialNeed?.name,
          specialNeedSubcategoryId: sub.id,
          specialNeedSubcategoryName: sub.name,
        })) ?? [],

      // Dados de controle
      observations: user.studentProfile?.observations,
      supportNotes: user.studentProfile?.supportNotes,
      isStudent: user.studentProfile?.isStudent ?? true,
    })) as StudentListDto[];

    return {
      data: students,
      pagination: paginatedResult.pagination,
    };
  }

  async createStudent(
    createStudentDto: CreateStudentDto,
  ): Promise<StudentListDto> {
    const { firstName, lastName, email, password, avatarUrl, ...profileData } =
      createStudentDto;

    // Verificar se já existe usuário com o mesmo email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    // Criar usuário
    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password,
      avatarUrl,
      role: Role.STUDENT,
    });

    const savedUser = await this.userRepository.save(user);

    // Criar perfil do estudante
    const {
      specialNeedSubcategories: subcategoryIds,
      ...profileDataWithoutSubcategories
    } = profileData;
    const subcategories =
      await this.specialNeedSubcategoryRepository.findByIds(subcategoryIds);
    let studentProfile;
    try {
      studentProfile = this.studentProfileRepository.create({
        userId: savedUser.id,
        ...profileDataWithoutSubcategories,
        specialNeedSubcategories: subcategories,
        isStudent: profileData.isStudent ?? true,
      });
      await this.studentProfileRepository.save(studentProfile);
    } catch (error) {
      // Rollback: remover usuário criado se der erro ao salvar perfil
      await this.userRepository.delete(savedUser.id);
      throw error;
    }

    // Retornar dados completos
    const completeUser = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: [
        'studentProfile',
        'studentProfile.specialNeedSubcategories',
        'studentProfile.specialNeedSubcategories.specialNeed',
      ],
    });

    if (!completeUser) {
      throw new NotFoundException('Erro ao criar estudante');
    }

    return {
      id: completeUser.id,
      firstName: completeUser.firstName,
      lastName: completeUser.lastName,
      email: completeUser.email,
      avatarUrl: completeUser.avatarUrl,
      role: completeUser.role,
      occupation: completeUser.occupation,
      createdAt: completeUser.createdAt,
      updatedAt: completeUser.updatedAt,

      // Dados do perfil
      phoneNumber: completeUser.studentProfile?.phoneNumber,
      cpf: completeUser.studentProfile?.cpf,
      rg: completeUser.studentProfile?.rg,
      gender: completeUser.studentProfile?.gender,
      maritalStatus: completeUser.studentProfile?.maritalStatus,
      birthDate: completeUser.studentProfile?.birthDate,
      course: completeUser.studentProfile?.course,
      enrollmentDate: completeUser.studentProfile?.enrollmentDate,

      // Endereço
      cep: completeUser.studentProfile?.cep,
      state: completeUser.studentProfile?.state,
      city: completeUser.studentProfile?.city,
      neighborhood: completeUser.studentProfile?.neighborhood,
      street: completeUser.studentProfile?.street,
      number: completeUser.studentProfile?.number,
      complement: completeUser.studentProfile?.complement,

      // Necessidades especiais
      specialNeeds:
        completeUser.studentProfile?.specialNeedSubcategories?.map((sub) => ({
          specialNeedId: sub.specialNeed?.id,
          specialNeedName: sub.specialNeed?.name,
          specialNeedSubcategoryId: sub.id,
          specialNeedSubcategoryName: sub.name,
        })) ?? [],

      // Dados de controle
      observations: completeUser.studentProfile?.observations,
      supportNotes: completeUser.studentProfile?.supportNotes,
      isStudent: completeUser.studentProfile?.isStudent ?? true,
    };
  }

  async updateStudent(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<StudentListDto> {
    const user = await this.userRepository.findOne({
      where: { id, role: Role.STUDENT },
      relations: [
        'studentProfile',
        'studentProfile.specialNeedSubcategories',
        'studentProfile.specialNeedSubcategories.specialNeed',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Estudante com ID ${id} não encontrado`);
    }

    // Separar dados do usuário e do perfil
    const { firstName, lastName, email, avatarUrl, ...profileData } =
      updateStudentDto;

    // Atualizar dados do usuário se fornecidos
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await this.userRepository.save(user);

    // Atualizar ou criar perfil do estudante
    if (user.studentProfile) {
      // Atualizar perfil existente
      Object.assign(user.studentProfile, profileData);
      await this.studentProfileRepository.save(user.studentProfile);
    } else {
      // Criar novo perfil
      const studentProfile = this.studentProfileRepository.create({
        userId: user.id,
        ...profileData,
        isStudent: profileData.isStudent ?? true,
      });
      await this.studentProfileRepository.save(studentProfile);
    }

    // Retornar dados completos atualizados
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: [
        'studentProfile',
        'studentProfile.specialNeedSubcategories',
        'studentProfile.specialNeedSubcategories.specialNeed',
      ],
    });

    if (!updatedUser) {
      throw new NotFoundException(`Estudante com ID ${id} não encontrado`);
    }

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      occupation: updatedUser.occupation,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,

      // Dados do perfil
      phoneNumber: updatedUser.studentProfile?.phoneNumber,
      cpf: updatedUser.studentProfile?.cpf,
      rg: updatedUser.studentProfile?.rg,
      gender: updatedUser.studentProfile?.gender,
      maritalStatus: updatedUser.studentProfile?.maritalStatus,
      birthDate: updatedUser.studentProfile?.birthDate,
      course: updatedUser.studentProfile?.course,
      enrollmentDate: updatedUser.studentProfile?.enrollmentDate,

      // Endereço
      cep: updatedUser.studentProfile?.cep,
      state: updatedUser.studentProfile?.state,
      city: updatedUser.studentProfile?.city,
      neighborhood: updatedUser.studentProfile?.neighborhood,
      street: updatedUser.studentProfile?.street,
      number: updatedUser.studentProfile?.number,
      complement: updatedUser.studentProfile?.complement,

      // Necessidades especiais
      specialNeeds:
        updatedUser.studentProfile?.specialNeedSubcategories?.map((sub) => ({
          specialNeedId: sub.specialNeed?.id,
          specialNeedName: sub.specialNeed?.name,
          specialNeedSubcategoryId: sub.id,
          specialNeedSubcategoryName: sub.name,
        })) ?? [],

      // Dados de controle
      observations: updatedUser.studentProfile?.observations,
      supportNotes: updatedUser.studentProfile?.supportNotes,
      isStudent: updatedUser.studentProfile?.isStudent ?? true,
    };
  }

  async getStudentById(id: number): Promise<StudentListDto> {
    const user = await this.userRepository.findOne({
      where: { id, role: Role.STUDENT },
      relations: [
        'studentProfile',
        'studentProfile.specialNeedSubcategories',
        'studentProfile.specialNeedSubcategories.specialNeed',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Estudante com ID ${id} não encontrado`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      occupation: user.occupation,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // Dados do perfil
      phoneNumber: user.studentProfile?.phoneNumber,
      cpf: user.studentProfile?.cpf,
      rg: user.studentProfile?.rg,
      gender: user.studentProfile?.gender,
      maritalStatus: user.studentProfile?.maritalStatus,
      birthDate: user.studentProfile?.birthDate,
      course: user.studentProfile?.course,
      enrollmentDate: user.studentProfile?.enrollmentDate,

      // Endereço
      cep: user.studentProfile?.cep,
      state: user.studentProfile?.state,
      city: user.studentProfile?.city,
      neighborhood: user.studentProfile?.neighborhood,
      street: user.studentProfile?.street,
      number: user.studentProfile?.number,
      complement: user.studentProfile?.complement,

      // Necessidades especiais
      specialNeeds:
        user.studentProfile?.specialNeedSubcategories?.map((sub) => ({
          specialNeedId: sub.specialNeed?.id,
          specialNeedName: sub.specialNeed?.name,
          specialNeedSubcategoryId: sub.id,
          specialNeedSubcategoryName: sub.name,
        })) ?? [],

      // Dados de controle
      observations: user.studentProfile?.observations,
      supportNotes: user.studentProfile?.supportNotes,
      isStudent: user.studentProfile?.isStudent ?? true,
    };
  }
}
