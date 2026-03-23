import { IsOptional } from 'class-validator';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar', select: false, nullable: true })
    @IsOptional()
    password: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    avatar?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    @IsOptional()
    provider?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @CreateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}