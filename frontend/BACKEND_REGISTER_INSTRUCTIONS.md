# Instruções para implementação do Endpoint de Registro (Backend)

## Resumo

O frontend foi atualizado com uma página de registro de usuários. Você precisa implementar o endpoint `/auth/register` no seu backend para completar a funcionalidade.

## O que foi criado no Frontend

### 1. Nova página: `Register.tsx`
- Campos: Email, Senha e Confirmação de Senha
- Validações locais:
  - Todos os campos obrigatórios
  - Senha mínima de 6 caracteres
  - Confirmação de senha igual à senha
- Chama a função `register` do `AuthContext`

### 2. Atualização em `AuthContext.tsx`
- Adicionada função `register(email: string, password: string)`
- Faz requisição POST para: `http://localhost:3000/auth/register`
- Espera resposta com campo `access_token`
- Salva token no localStorage e redireciona para `/home`

### 3. Atualização em `Login.tsx`
- Adicionado botão "Create account" que navega para `/register`

### 4. Atualização em `App.tsx`
- Adicionada rota: `GET /register` → componente `Register`

## O que você precisa fazer no Backend

### Endpoint a implementar:
```
POST /auth/register
```

### Payload esperado:
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

### Resposta esperada (sucesso - 201 Created):
```json
{
  "access_token": "seu_jwt_token_aqui"
}
```

### Tratamento de erros esperados:

**Email já existe (409 Conflict):**
```json
{
  "message": "Email já cadastrado"
}
```

**Email inválido (400 Bad Request):**
```json
{
  "message": "Email inválido"
}
```

**Erro na criação (500 Internal Server Error):**
```json
{
  "message": "Erro ao criar conta"
}
```

## Pseudo-código da lógica esperada

```typescript
// auth.controller.ts
@Post('register')
async register(@Body() { email, password }: CreateUserDto) {
  try {
    // 1. Validar email
    if (!isValidEmail(email)) {
      throw new BadRequestException('Email inválido');
    }

    // 2. Verificar se email já existe
    const userExists = await this.userService.findByEmail(email);
    if (userExists) {
      throw new ConflictException('Email já cadastrado');
    }

    // 3. Criar novo usuário (userService.create)
    const user = await this.userService.create({ email, password });

    // 4. Gerar JWT token
    const token = await this.jwtService.sign({ sub: user._id, email: user.email });

    // 5. Retornar token
    return { access_token: token };
  } catch (error) {
    throw error;
  }
}
```

## Notas importantes

1. **Senha**: Certifique-se de fazer hash da senha antes de salvar (use bcrypt ou similar)
2. **JWT**: Use o mesmo serviço de JWT que usa no login
3. **Email**: Valide e normalize o email (converter para minúsculas)
4. **Usuário Service**: Use sua função `create()` existente

## Testes

Para testar depois da implementação:

1. Abra http://localhost:5173/ (ou porta do seu frontend)
2. Clique em "Create account"
3. Preencha um email e senha (min 6 caracteres)
4. Clique em "Create account"
5. Se funcionar, você será redirecionado para `/home` com um token no localStorage

Pronto! O frontend está 100% pronto para consumir o endpoint.
