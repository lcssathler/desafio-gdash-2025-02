import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    async registerUser(@Body() body: { email: string; password: string; name: string}) {
        if (!body.email || !body.password) {
            return { success: false, message: 'Email and password are required' };
        }

        await this.usersService.create(body.email, body.password, body.name);
        return { success: true, message: 'User registered successfully' };
    }   
}
