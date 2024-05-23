export const convertFromNameToId = (circleName: string) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  return alphabet.split('').findIndex(letter => letter === circleName.toLocaleLowerCase())
}

export const convertNameListToIdList = (nameList: string[][]) => {
  return nameList.map(names =>
    names.map(name => convertFromNameToId(name))
  )
}