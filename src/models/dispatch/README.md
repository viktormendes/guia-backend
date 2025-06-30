# Sistema de Dispatch Presencial (Integração Mobile)

## O que é?
Permite que estudantes solicitem ajuda presencial e compartilhem localização em tempo real com o ajudante, que também compartilha sua localização. O sistema avisa quando ambos estão próximos (≤ 100 metros) e permite cancelar ou finalizar a ajuda.

---

## Rotas REST

### 1. Criar Dispatch
```http
POST /dispatch/create
Authorization: Bearer <token>
Content-Type: application/json
{
  "description": "Preciso de ajuda com matemática",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "address": "Bloco A, Sala 101",
  "accuracy": 10
}
```

### 2. Aceitar Dispatch
```http
POST /dispatch/accept/:helpId
Authorization: Bearer <token>
```

### 3. Atualizar Localização
```http
POST /dispatch/update-location
Authorization: Bearer <token>
Content-Type: application/json
{
  "latitude": -23.5505,
  "longitude": -46.6333,
  "address": "Bloco A, Corredor",
  "accuracy": 5
}
```

### 4. Cancelar Dispatch
```http
POST /dispatch/cancel/:helpId
Authorization: Bearer <token>
Content-Type: application/json
{
  "reason": "Não posso mais ajudar"
}
```

### 5. Finalizar Dispatch
```http
POST /dispatch/complete/:helpId
Authorization: Bearer <token>
```

### 6. Obter Localização de um Usuário
```http
GET /dispatch/location/:userId
```

---

## WebSocket (namespace `/dispatch`)

### Como conectar
```js
const socket = io('http://<BACKEND_URL>/dispatch', {
  auth: { token: '<JWT do usuário>' }
});
```

### Eventos do Cliente → Servidor

#### joinDispatch
```js
socket.emit('joinDispatch', helpId);
```

#### leaveDispatch
```js
socket.emit('leaveDispatch', helpId);
```

#### updateLocation
```js
socket.emit('updateLocation', {
  latitude: -23.5505,
  longitude: -46.6333,
  address: "Bloco A, Sala 101",
  accuracy: 5
});
```

### Eventos do Servidor → Cliente

#### currentLocations
```js
socket.on('currentLocations', (data) => {
  // data.locations: [{ userId, latitude, longitude, ... }]
});
```

#### locationUpdated
```js
socket.on('locationUpdated', (data) => {
  // data: { userId, location, helpId }
});
```

#### usersNearby
```js
socket.on('usersNearby', (data) => {
  // data.message: "Vocês estão próximos um do outro!"
});
```

#### helpCancelled
```js
socket.on('helpCancelled', (data) => {
  // data.reason
});
```

#### helpCompleted
```js
socket.on('helpCompleted', (data) => {
  // Ajuda finalizada!
});
```

---

## Fluxo sugerido para o app

1. **Estudante** faz o pedido de dispatch via REST e já envia sua localização.
2. **Ajudante** recebe notificação, aceita via REST.
3. Ambos conectam no socket `/dispatch` e entram na sala do helpId com `joinDispatch`.
4. Ambos enviam atualizações de localização em tempo real com `updateLocation`.
5. O app escuta os eventos do socket para mostrar a localização do outro e avisar quando estão próximos.
6. Qualquer um pode cancelar ou finalizar a ajuda via REST.
7. O app escuta os eventos de cancelamento/finalização para atualizar a interface.

---

## Dicas
- Sempre envie o JWT no header Authorization nas rotas REST e no auth do socket.
- O helpId é retornado na criação do dispatch e deve ser usado para as ações seguintes.
- O sistema avisa automaticamente quando os usuários estão próximos.
- O app pode mostrar a localização do outro participante em um mapa em tempo real.

---

Se precisar de exemplos de código para React Native, Flutter ou outra stack, peça para a IA gerar usando este guia! 