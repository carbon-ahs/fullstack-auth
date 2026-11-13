import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module.js';
import { StudentsService } from './students/students.service.js';
import { StudentsModule } from './students/students.module.js';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    FilesModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, StudentsService],
})
export class AppModule {}
