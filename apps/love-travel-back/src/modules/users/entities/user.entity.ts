import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @Column({ type: 'varchar', length: 100})
    name: string;

    @Column({ type: 'varchar', length: 150, unique: true})
    email: string;

    @Column({ type: 'varchar', select: false})
    password: string;

    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date;

    @CreateDateColumn({ name: 'updated_at'})
    updatedAt: Date;
}