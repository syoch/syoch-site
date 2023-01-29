# Cat Framework/Workspace Notes

## CWorks URI

```js
/([^:]+):\/\/(([^@]+@)?)([^:]+(:[?\d]+))([^\?]+)((\?[^\?]+)?)/
```

```plain
<scheme>://[<connection arg>@]<host>[:<port>]/<path>?<request argument>
```

### example

- `cftp://root=~storage_mlc@192.168.1.3/...`
- `cworks://cheat-codes.wiiu.org/fly?combo=0x40`

### Schemes

- http
- https
- cworks
- cftp
- ...

## CWorks domains

- local
  - ...
- group
  - <group-name>
    - ...
- usr
  - <user-id>
    - ...
- me: config

## Protocols

### CWorks Protocol

```plain
string: <length: uint16_t><str: char[length]>
```

- `Server -> Client` `02 <s_sock: uint32_t><c_sock: uint32_t><c_ident: string>`
  - Notify connection.
  - 00 -> Allow
  - ff -> Deny
- `Client -> Server` `02 <host: string><port: uint16_t>`
  - Connect to host.
  - `00 <c_socket: uint32_t>` -> Success
  - `<error: errno>` -> Failed

- `Client -> Server` `03 <socket: uint32_t>`
  - Disconnect from server or disconnect client
  - `00`: Success
  - `<error: errno>`: Failed
- `Server -> Client` `03 <socket: uint32_t>`: Notify disconnected.

- `C -> S || S -> C` `00 <socket: uint32_t><data: bytes>`: Send data

- `Client -> Server` `10 <host: string><port: uint16_t>`
  - Set host:port as connectable
  - `00: <s_sock: uint32_t>`: Successed
  - `<error: errno>`: Failed

#### Example

##### Simple server

```plain
C->S: 10 "codes.wiiu.~syoch.usr" 0050[80]
S->C: 00 00 00000000 ""

S->C: 02 00000000 00000001 'Wii U User'
C->S: 00

S->C: 00 00000001 b'{"url": "/code", query="combo=0x40"}'
C->S: 00 00000001 '{"response": "0: OK", 'data': {"fmt": "PCode1", "code": "["
      "[0x10000000]+0x10] = 1 as 8bit"}}'

S->C: 03 00000001
C->S: 00
```

## CCFW API

### CCFW Token

Header の X-Token
abcdefghABCDEFGH みたいな形式（[\w0-9-_]{16}）

### CCFW REST API

- /ccfw
  - /api
    - /serve: WebSocket: Serving Protocol
    - /cworks-proto: WebSocket Client Protocol
    - /auth/salt: POST "id=..."
    - /auth/login: POST "id=...&salt=...&hash=<SHA512>"
  - spec.json: `{"features": ["serve", "auth"]}`