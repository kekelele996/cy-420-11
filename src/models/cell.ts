import { CellType } from '../constants/cell'; export interface Cell { x:number; y:number; owner_id?:string; type:CellType }
