import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SpecialNeedSubcategory } from '../../special-need/entities/special-need-subcategory.entity';
import { Gender } from '../../../common/enums/gender.enum';
import { MaritalStatus } from '../../../common/enums/marital-status.enum';
import { NeedDuration } from '../../../common/enums/need-duration.enum';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Dados pessoais
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rg: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus: MaritalStatus;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  // Dados acadêmicos
  @Column({ type: 'varchar', length: 200, nullable: true })
  course: string;

  @Column({ type: 'date', nullable: true })
  enrollmentDate: Date;

  // Dados de endereço
  @Column({ type: 'varchar', length: 9, nullable: true })
  cep: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  number: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  complement: string;

  // NOVO: Relação ManyToMany para subcategorias de necessidades especiais
  @ManyToMany(() => SpecialNeedSubcategory)
  @JoinTable({
    name: 'student_profile_special_need_subcategory',
    joinColumn: { name: 'student_profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'special_need_subcategory_id',
      referencedColumnName: 'id',
    },
  })
  specialNeedSubcategories: SpecialNeedSubcategory[];

  @Column({ type: 'enum', enum: NeedDuration, nullable: true })
  needDuration: NeedDuration;

  // Dados de controle
  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  supportNotes: string;

  @Column({ type: 'boolean', default: true })
  isStudent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
