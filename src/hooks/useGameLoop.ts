import { onMounted, onUnmounted } from 'vue';
import { useGameStore } from '../stores/gameStore';

declare global {
  interface Window {
    advanceTime?: (ms: number) => void;
    render_game_to_text?: () => string;
    __territoryrush_snapshot?: string;
  }
}

window.__territoryrush_snapshot ||= JSON.stringify({ origin: 'top-left x-right y-down', mode: 'booting' });
window.render_game_to_text = () => window.__territoryrush_snapshot || '{}';

export function useGameLoop() {
  const store = useGameStore();
  let timer = 0;
  onMounted(() => {
    timer = window.setInterval(() => {
      if (store.state) store.state.tick++;
    }, 120);
    window.advanceTime = (ms: number) => {
      const steps = Math.max(1, Math.round(ms / 120));
      for (let i = 0; i < steps; i++) if (store.state) store.state.tick++;
    };
  });
  onUnmounted(() => clearInterval(timer));
}
