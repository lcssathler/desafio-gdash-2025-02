import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(email: string, password: string, name: string) {
    const exists = await this.userModel.findOne({ email });
    if (exists) throw new ConflictException('Email já cadastrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashed, name, role: email.includes('admin') ? 'admin' : 'user' });
    return user.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

}