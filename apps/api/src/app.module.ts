import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './students/students.module.js';
import { FilesModule } from './files/files.module.js';

@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot({ isGlobal: true }), StudentsModule, FilesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
