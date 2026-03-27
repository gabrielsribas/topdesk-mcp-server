# Docker Configuration Guide

Este guia explica como usar o TOPdesk MCP Server com Docker e proxies MCP.

## 🐳 Usando com Docker

### Opção 1: Docker Run Simples

```bash
docker run -it --rm \
  -e TOPDESK_BASE_URL="https://your-instance.topdesk.net/tas/api" \
  -e TOPDESK_USERNAME="seu_usuario" \
  -e TOPDESK_PASSWORD="sua_senha" \
  node:18-alpine \
  npx -y github:seu-usuario/topdesk-mcp-server
```

### Opção 2: Docker Compose

```yaml
version: '3.8'

services:
  topdesk-mcp:
    image: node:18-alpine
    command: npx -y github:seu-usuario/topdesk-mcp-server
    environment:
      - TOPDESK_BASE_URL=${TOPDESK_BASE_URL}
      - TOPDESK_USERNAME=${TOPDESK_USERNAME}
      - TOPDESK_PASSWORD=${TOPDESK_PASSWORD}
    stdin_open: true
    tty: true
```

### Opção 3: Dockerfile Customizado

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar globalmente
RUN npx -y github:seu-usuario/topdesk-mcp-server

# Ou copiar código local
# COPY package*.json ./
# RUN npm ci --only=production
# COPY dist ./dist

# Variáveis de ambiente (pode ser override via docker run)
ENV TOPDESK_BASE_URL=""
ENV TOPDESK_USERNAME=""
ENV TOPDESK_PASSWORD=""

CMD ["npx", "-y", "github:seu-usuario/topdesk-mcp-server"]
```

## 🔌 Usando com Proxy MCP

### Configuração de Rede

O proxy MCP precisa acessar o servidor TOPdesk. Existem duas abordagens:

#### Abordagem 1: Servidor MCP no Host (Recomendado)

Execute o servidor MCP no host e o proxy no container:

```yaml
# docker-compose.yml do proxy
version: '3.8'

services:
  proxy-mcp:
    image: seu-proxy-mcp:latest
    ports:
      - "3000:3000"
    extra_hosts:
      - "host.docker.internal:host-gateway"  # Linux
    environment:
      - MCP_SERVER_URL=http://host.docker.internal:8080
```

**No host, execute o servidor MCP**:
```bash
cd /home/gribas/repos/topdesk-mcp-server
TOPDESK_BASE_URL="..." \
TOPDESK_USERNAME="..." \
TOPDESK_PASSWORD="..." \
node dist/index.js
```

#### Abordagem 2: Ambos em Containers (Mesma Rede)

```yaml
# docker-compose.yml
version: '3.8'

networks:
  mcp-network:
    driver: bridge

services:
  topdesk-mcp:
    image: node:18-alpine
    container_name: topdesk-mcp-server
    command: npx -y github:seu-usuario/topdesk-mcp-server
    environment:
      - TOPDESK_BASE_URL=${TOPDESK_BASE_URL}
      - TOPDESK_USERNAME=${TOPDESK_USERNAME}
      - TOPDESK_PASSWORD=${TOPDESK_PASSWORD}
    networks:
      - mcp-network
    stdin_open: true
    tty: true

  proxy-mcp:
    image: seu-proxy-mcp:latest
    container_name: proxy-mcp
    ports:
      - "3000:3000"
    environment:
      - MCP_SERVER_URL=http://topdesk-mcp-server:8080
    networks:
      - mcp-network
    depends_on:
      - topdesk-mcp
```

#### Abordagem 3: Host Network Mode (Linux)

```yaml
services:
  proxy-mcp:
    image: seu-proxy-mcp:latest
    network_mode: "host"  # Compartilha rede com host
    environment:
      - MCP_SERVER_URL=http://localhost:8080
```

## 🔧 Troubleshooting

### Erro: "getaddrinfo ENOTFOUND host.docker.internal"

**Causa**: Container não consegue resolver `host.docker.internal`

**Soluções**:

1. **Linux**: Adicionar `extra_hosts` no docker-compose:
   ```yaml
   extra_hosts:
     - "host.docker.internal:host-gateway"
   ```

2. **Docker Run**: Adicionar flag:
   ```bash
   docker run --add-host=host.docker.internal:host-gateway ...
   ```

3. **Usar IP do host diretamente**:
   ```bash
   # Descobrir IP do host
   ip addr show docker0 | grep inet
   
   # Usar IP no proxy
   MCP_SERVER_URL=http://172.17.0.1:8080
   ```

4. **Usar mesma rede Docker**:
   - Coloque ambos na mesma rede
   - Use nome do container como hostname

### Erro: "TOPdesk API error (400): Bad Request"

**Causa**: Parâmetros inválidos sendo enviados para API TOPdesk

**Fix aplicado**: O servidor agora remove automaticamente:
- Strings vazias (`''`)
- Valores `undefined` ou `null`
- Valores NaN

**Se persistir**:
1. Verifique os logs do servidor MCP
2. Confirme que a URL base está correta
3. Teste credenciais com curl:
   ```bash
   curl -u "username:password" \
     "https://your-instance.topdesk.net/tas/api/version"
   ```

### Erro: "Connection refused"

**Causa**: Servidor MCP não está rodando ou inacessível

**Soluções**:
1. Verificar se servidor está rodando:
   ```bash
   # No host
   ps aux | grep node
   netstat -tlnp | grep 8080
   ```

2. Testar conectividade do container:
   ```bash
   docker exec proxy-mcp ping host.docker.internal
   docker exec proxy-mcp wget -O- http://host.docker.internal:8080/health
   ```

3. Verificar firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 8080
   ```

## 📊 Exemplo Completo: Proxy MCP + TOPdesk

### Estrutura de Diretórios

```
project/
├── docker-compose.yml
├── .env
└── topdesk-mcp-server/  (este repositório)
```

### docker-compose.yml

```yaml
version: '3.8'

networks:
  mcp-network:
    driver: bridge

services:
  # Servidor MCP TOPdesk
  topdesk-mcp:
    image: node:18-alpine
    container_name: topdesk-mcp
    command: sh -c "npx -y github:seu-usuario/topdesk-mcp-server"
    environment:
      TOPDESK_BASE_URL: ${TOPDESK_BASE_URL}
      TOPDESK_USERNAME: ${TOPDESK_USERNAME}
      TOPDESK_PASSWORD: ${TOPDESK_PASSWORD}
    networks:
      - mcp-network
    healthcheck:
      test: ["CMD", "pgrep", "node"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  # Proxy MCP (exemplo genérico)
  proxy-mcp:
    image: seu-proxy-mcp:latest
    container_name: proxy-mcp
    ports:
      - "3000:3000"
    environment:
      MCP_SERVERS: '{"topdesk": "http://topdesk-mcp:8080"}'
    networks:
      - mcp-network
    depends_on:
      topdesk-mcp:
        condition: service_healthy
    restart: unless-stopped
```

### .env

```bash
TOPDESK_BASE_URL=https://your-instance.topdesk.net/tas/api
TOPDESK_USERNAME=seu_usuario
TOPDESK_PASSWORD=sua_senha
```

### Comandos

```bash
# Subir tudo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Logs apenas do TOPdesk
docker-compose logs -f topdesk-mcp

# Parar tudo
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build
```

## 🔍 Debug

### Ver Logs do Servidor MCP

```bash
# Logs em tempo real
docker-compose logs -f topdesk-mcp

# Últimas 100 linhas
docker-compose logs --tail=100 topdesk-mcp
```

### Testar Conexão Dentro do Container

```bash
# Entrar no container do proxy
docker exec -it proxy-mcp sh

# Testar DNS
nslookup topdesk-mcp

# Testar conectividade
wget -O- http://topdesk-mcp:8080/health

# Ver variáveis de ambiente
env | grep TOPDESK
```

### Verificar Rede

```bash
# Listar redes
docker network ls

# Inspecionar rede
docker network inspect mcp-network

# Ver containers na rede
docker network inspect mcp-network | grep -A 3 Containers
```

## 🎯 Boas Práticas

### Segurança

1. **Não exponha portas desnecessárias**:
   ```yaml
   # Apenas proxy precisa de porta exposta
   proxy-mcp:
     ports:
       - "3000:3000"
   
   # Servidor MCP não precisa
   topdesk-mcp:
     # sem ports
   ```

2. **Use secrets do Docker**:
   ```yaml
   services:
     topdesk-mcp:
       secrets:
         - topdesk_password
   
   secrets:
     topdesk_password:
       file: ./secrets/password.txt
   ```

3. **Variáveis sensíveis em arquivo .env**:
   ```bash
   # Adicionar .env ao .gitignore
   echo ".env" >> .gitignore
   ```

### Performance

1. **Use healthchecks**:
   ```yaml
   healthcheck:
     test: ["CMD", "pgrep", "node"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

2. **Configure restart policies**:
   ```yaml
   restart: unless-stopped
   ```

3. **Limite recursos**:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

### Logs

1. **Configure log rotation**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

## 📚 Recursos

- [Docker Networking](https://docs.docker.com/network/)
- [Docker Compose](https://docs.docker.com/compose/)
- [host.docker.internal](https://docs.docker.com/desktop/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host)

---

**Problema resolvido?** Se ainda tiver erros, compartilhe os logs! 🐛
