# NestJS
### Install nestjs
`npm i -g @nestjs/cli`

### Create new project
`nest new <project-name>`

### Run server in development mode
`npm run start:dev`

### Create module
`nest generate module <name>`

`nest g mo <name> --no-spec`

### Create controller
`nest generate controller <name>`

`nest g co <name> --no-spec`

### Create service (provider)
`nest generate service <name>`

`nest g s <name> --no-spec`

### Add packages
#### DB management

`npm add -D prisma`

`npm add -D @prisma/client`

##### Initialize prisma
`npx prisma init`

#### Form validation
`npm add -D class-validator class-transformer`

#### Password hashing
`npm add argon2`

### Decorators
- `@Injectable()`: Make a resource injectable via DI
- `@Controller('route')`:
- `@Get()`, `@Post('user/:id/update')`
- `@HttpCode(HttpStatus.GONE)`: Change http status
- `@Param() params`: All url params, `@Param('id')`: Only id param
- `@Query() params`: All url params, `@Query('id')`: Only id param
- `@Body() body`: All body values, `@Body('id')`: Only id value
- `@Res() response`: Response object from express
- `@IsNumber()`, `@IsString()`: Validations

# React 
### Install reactjs
`npm i -g create-react-app`

### Create new project
`create-react-app <project-name> --template typescript`

`npx create-react-app <project-name> --template typescript`

### Run frontend
`npm start`

### Deploy to production
`npm run build`
