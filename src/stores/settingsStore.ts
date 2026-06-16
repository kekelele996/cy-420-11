import { defineStore } from 'pinia'; export const useSettingsStore=defineStore('settings',{state:()=>({sound:true,reconnect:true}),actions:{toggleSound(){this.sound=!this.sound;}}});
