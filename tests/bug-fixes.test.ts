import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { useRoomStore } from '../src/stores/roomStore';
import { useGameStore } from '../src/stores/gameStore';
import { websocketService } from '../src/services/websocketService';
import { fillTerritory } from '../src/utils/floodFill';
import { MAP_CONFIG } from '../src/constants/map';
import { CellType } from '../src/constants/cell';
import { createPinia, setActivePinia } from 'pinia';

describe('Bug Fixes Verification', () => {
  before(() => {
    setActivePinia(createPinia());
  });

  describe('Bug 1: 创建或快速加入房间后等待页头像不显示', () => {
    it('create() 应该将玩家添加到 room.players', () => {
      const roomStore = useRoomStore();
      const roomId = roomStore.create('测试房间');
      const room = websocketService.rooms.find(r => r.id === roomId);
      assert.ok(room, '房间应该存在');
      assert.equal(room.players.length, 1, '房间应该有 1 个玩家');
      assert.equal(room.players[0].id, 'p-local', '玩家 ID 应该是 p-local');
      assert.equal(room.players[0].nickname, '你', '玩家昵称应该是"你"');
    });

    it('join() 应该将玩家添加到 room.players（去重）', () => {
      const roomStore = useRoomStore();
      const existingRoom = websocketService.rooms[0];
      roomStore.join(existingRoom.id);
      const room = websocketService.rooms.find(r => r.id === existingRoom.id);
      assert.ok(room, '房间应该存在');
      const localPlayers = room.players.filter(p => p.id === 'p-local');
      assert.equal(localPlayers.length, 1, 'p-local 玩家只能有一个（去重）');
    });
  });

  describe('Bug 2: 对战初始分数显示 0', () => {
    it('makeState() 应该返回初始分数为 1 的玩家', () => {
      const state = websocketService.makeState('test-room');
      assert.equal(state.players[0].score, 1, '玩家初始分数应该是 1');
      assert.equal(state.leaderboards[0].score, 1, '排行榜初始分数应该是 1');
    });

    it('起始位置 (5,5) 应该是 TERRITORY 类型且有 owner_id', () => {
      const state = websocketService.makeState('test-room');
      const startCell = state.map[5][5];
      assert.equal(startCell.type, CellType.TERRITORY, '起始格应该是 TERRITORY');
      assert.equal(startCell.owner_id, 'p-local', '起始格 owner_id 应该是玩家 ID');
    });

    it('move() 占领领土后应该同步更新 leaderboards', () => {
      const gameStore = useGameStore();
      gameStore.start('test-room');
      const initialScore = gameStore.state!.players[0].score;
      for (let i = 0; i < 5; i++) {
        gameStore.move(1, 0);
      }
      const playerScore = gameStore.state!.players[0].score;
      const lbScore = gameStore.state!.leaderboards[0].score;
      assert.ok(playerScore > initialScore, '玩家分数应该增加');
      assert.equal(playerScore, lbScore, '排行榜分数应该和玩家分数一致');
    });
  });

  describe('Bug 3: 角色到不了最右列', () => {
    it('x 坐标上限应该是 MAP_CONFIG.width - 1 (31)', () => {
      const gameStore = useGameStore();
      gameStore.start('test-room');
      for (let i = 0; i < 50; i++) {
        gameStore.move(1, 0);
      }
      const x = gameStore.state!.players[0].position.x;
      assert.equal(x, MAP_CONFIG.width - 1, `x 应该能到达 ${MAP_CONFIG.width - 1}`);
      assert.equal(x, 31, 'x 应该能到达 31（最右列）');
    });

    it('y 坐标上限应该是 MAP_CONFIG.height - 1 (21)', () => {
      const gameStore = useGameStore();
      gameStore.start('test-room');
      for (let i = 0; i < 50; i++) {
        gameStore.move(0, 1);
      }
      const y = gameStore.state!.players[0].position.y;
      assert.equal(y, MAP_CONFIG.height - 1, `y 应该能到达 ${MAP_CONFIG.height - 1}`);
      assert.equal(y, 21, 'y 应该能到达 21（最下行）');
    });
  });

  describe('Bug 4: 闭合路径占领后分数少一格', () => {
    it('fillTerritory() 返回的 captured 不应该被 slice(1)', () => {
      const state = websocketService.makeState('test-room');
      const beforeCount = state.map.flat().filter(c => c.type === CellType.TERRITORY).length;
      const captured = fillTerritory(state.map, 'p-local');
      const afterCount = state.map.flat().filter(c => c.type === CellType.TERRITORY).length;
      assert.equal(captured.length, afterCount - beforeCount, 'captured 长度应该等于新增的领土格数');
      assert.ok(captured.length > 0, '应该至少占领 1 格');
      const firstCaptured = captured[0];
      assert.ok(firstCaptured.type === CellType.TERRITORY, 'captured 中的格子应该被标记为 TERRITORY');
      assert.ok(firstCaptured.owner_id === 'p-local', 'captured 中的格子应该有正确的 owner_id');
    });

    it('游戏中领土占领后分数增加量应该等于 captured.length', () => {
      const gameStore = useGameStore();
      gameStore.start('test-room');
      const beforeScore = gameStore.state!.players[0].score;
      const beforeCells = gameStore.state!.map.flat().filter(c => c.type === CellType.TERRITORY).length;
      for (let i = 0; i < 5; i++) {
        gameStore.move(1, 0);
      }
      const afterScore = gameStore.state!.players[0].score;
      const afterCells = gameStore.state!.map.flat().filter(c => c.type === CellType.TERRITORY).length;
      const scoreDelta = afterScore - beforeScore;
      const cellsDelta = afterCells - beforeCells;
      assert.equal(scoreDelta, cellsDelta, '分数增加量应该等于领土格增加量');
    });
  });
});
