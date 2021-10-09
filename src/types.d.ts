import { ComputedRef, Ref } from 'vue'

export type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export type SpriteMap = {
  [key: string]: [number, number]
}


export interface ComposableOptions {
  threshold: MaybeRef<number>
  initialTimeout: MaybeRef<number>
  repeatTimeout: MaybeRef<number>
  buttonMapping: string[],
  controllerVibration: MaybeRef<boolean>
  mobileVibration: MaybeRef<boolean>
}

export interface GamepadModifiers {
  released?: MaybeRef<boolean>
  repeat?: MaybeRef<boolean>
}

export interface GamepadBinding {
  arg?: MaybeRef<any>
  value?: MaybeRef<any>
  expression?: MaybeRef<any>
}