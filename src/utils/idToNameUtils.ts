import { Ref, unref } from 'vue'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'

export const convertFromNameToId = (circleName: string | Ref<string>) => {
  const name = unref(circleName).toLocaleLowerCase()
  return alphabet.split('').findIndex(letter => letter === name)
}

export const convertNameListToIdList = (nameList: string[][] | Ref<string[][]>) => {
  const list = unref(nameList)
  return list.map(names => names.map(name => convertFromNameToId(name)))
}

export const convertFromIdToName = (circleId: number | Ref<number>) => {
  const id = unref(circleId)
  if (id < 26) return alphabet.split('')[id]
  else return 'No More Letters'
}

export const convertIdListToNameList = (idList: number[] | Ref<number[]>) => {
  const list = unref(idList)
  return list.map(id => convertFromIdToName(id))
}
