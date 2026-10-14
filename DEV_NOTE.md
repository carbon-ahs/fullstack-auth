# Developer Note

## Main source

- yt: https://youtu.be/Y9KNU2MnO-o?si=fgv34fCioGrNFl4L
- gh: https://github.com/vahid-nejad/NestJS-NextJS-Authentication-Turborepo

## Daily Log

- 13-10-2026: https://youtu.be/Y9KNU2MnO-o?si=-4zsT65-6pYX4WJU&t=784
- 14-10-2026: https://youtu.be/Y9KNU2MnO-o?si=BWcqX0VBOTv5Aan0&t=1430

## Install gotcha

- Turbo latest gives error, refer to this chat for install in any
  machine https://chatgpt.com/share/6acdfb62-5074-83e8-9282-587f31fd87c6
- Latest Turbo and NestJs uses different TypeScript version. it courses error. fix in monorepo

## Used Commands

### to pull db tables as prisma schema

```
npx prisma contract infer
```

```
npx prisma contract emit
npm install -D @nestjs/schematics@12.0.6

```

### Prisma schema to local DB

```
npx prisma db update
```

### NVM (a thing like fvm)

```
nvm install 24.21.0                   
nvm use 24.21.0
```
### Mix

```
nest g res auth --no-spec
nest g res user --no-spec

# For dto machanism 
npm i -D class-validator class-transformer

# password hasing
npm i argon2

```