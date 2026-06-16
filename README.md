# TerritoryRush 实时协同领土争夺战

## 快速启动

```bash
pnpm install
pnpm dev
```

访问地址：http://localhost:18420

TerritoryRush 是一款 Vue 3 + Canvas 2D 实时策略游戏演示。玩家在网格地图中移动、闭合路径、扩张领土，并通过模拟 WebSocket 与房间系统串联。

## 主要功能

- 首页：输入昵称、快速加入、创建房间、查看规则。
- 房间列表：刷新房间、加入房间。
- 等待页：玩家列表、颜色和开始游戏。
- 对战页：键盘移动、实时排行榜、观战切换、战场消息。
- 历史排行榜：查看本地最高分。

## 操作说明

方向键控制移动。连续移动形成路径，路径长度超过阈值后通过 flood fill 模拟占领区域。

## WebSocket 服务说明

`services/websocketService.ts` 提供模拟 WebSocket 服务，统一定义消息发送、接收、房间创建和 GameState 广播入口；消息类型与 `constants/websocket.ts`、stores、formatters 交叉引用，便于后续替换真实 Node.js WebSocket 服务。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript |
| 渲染 | Canvas 2D |
| UI | Vant + Tailwind CSS |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 实时通信 | 原生 WebSocket 模拟服务 |
| 持久化 | localStorage |

## 目录结构

```
src/
├── services/
├── models/
├── stores/
├── components/common/
├── hooks/
├── pages/
├── router/
├── utils/
└── constants/
```

## 枚举出现位置清单

PlayerStatus：
- `src/constants/player.ts`
- `src/models/player.ts`
- `src/services/websocketService.ts`
- `src/stores/gameStore.ts`
- `src/components/common/PlayerAvatar.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`
- `src/constants/logTemplates.ts`

RoomStatus：
- `src/constants/room.ts`
- `src/models/room.ts`
- `src/services/websocketService.ts`
- `src/stores/roomStore.ts`
- `src/components/common/RoomCard.vue`
- `src/pages/RoomWaiting.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

CellType：
- `src/constants/cell.ts`
- `src/models/cell.ts`
- `src/models/gameState.ts`
- `src/utils/mapRenderer.ts`
- `src/utils/floodFill.ts`
- `src/components/common/GameCanvas.vue`
- `src/stores/gameStore.ts`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

## License

MIT

